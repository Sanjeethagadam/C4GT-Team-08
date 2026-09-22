const AuthService = require('../services/auth.service');
const { sendSuccess, sendError } = require('../../../utils/response.util');
const { validationResult } = require('express-validator');

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 'Validation Error', 400, errors.array());
    }

    const { username, password } = req.body;
    const data = await AuthService.login(username, password);
    return sendSuccess(res, data);
  } catch (error) {
    if (error.message === 'Invalid credentials' || error.message === 'User account is inactive' || error.message === 'Your account is pending administrator approval.') {
      return sendError(res, error.message, 401);
    }
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const userDoc = await User.findById(req.user.id || req.user._id).select('-passwordHash').lean();
    if (!userDoc) {
      return sendError(res, 'User not found', 404);
    }
    // Also include jwt payload data like scopeRef if they don't match, but userDoc has them.
    // The frontend expects the format returned by login, which has id.
    userDoc.id = userDoc._id;
    return sendSuccess(res, userDoc);
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const userDoc = await User.findById(req.user.id || req.user._id);
    if (userDoc) {
      userDoc.lastActiveAt = null;
      await userDoc.save({ validateModifiedOnly: true });
    }
    return sendSuccess(res, { message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { fullName, email, username, password, phoneNumber } = req.body;
    
    if (!fullName || !username || !password) {
      return sendError(res, 'Missing required fields', 400);
    }

    const User = require('../models/User');
    
    // Duplicate check
    const existingUsername = await User.findOne({ username: username.trim() });
    if (existingUsername) {
      return sendError(res, 'Username already exists.', 400);
    }
    
    if (email) {
      const existingEmail = await User.findOne({ email: email.trim().toLowerCase() });
      if (existingEmail) {
        return sendError(res, 'Email address is already registered.', 400);
      }
    }

    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName: fullName.trim(),
      email: email ? email.trim().toLowerCase() : undefined,
      username: username.trim(),
      passwordHash,
      phoneNumber: phoneNumber ? phoneNumber.trim() : undefined,
      role: 'STUDENT',
      status: 'PENDING'
    });

    await newUser.save();
    return sendSuccess(res, { message: 'Registration successful. Your account is awaiting administrator approval.' });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const { fullName, email, phoneNumber, avatar } = req.body;
    
    const userDoc = await User.findById(req.user.id || req.user._id);
    if (!userDoc) {
      return sendError(res, 'User not found', 404);
    }
    
    let normalizedEmail;
    if (email !== undefined) {
      normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail === '') {
        normalizedEmail = undefined; // Undefined tells Mongoose to omit or unset
        userDoc.email = undefined;
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
          return sendError(res, 'Invalid email format.', 400);
        }
      }
    }

    // Validate uniqueness of email if it's being changed
    if (normalizedEmail && normalizedEmail !== userDoc.email) {
      const existingEmail = await User.findOne({ email: normalizedEmail });
      if (existingEmail) {
        return sendError(res, 'Email address is already in use by another account.', 400);
      }
    }
    
    const mongoose = require('mongoose');
    let bucket;
    if (mongoose.connection.db) {
      bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'avatars' });
    }

    let newAvatarFileId;
    let removeAvatar = false;
    
    if (req.file && bucket) {
      // Upload to GridFS
      const uploadStream = bucket.openUploadStream(req.file.originalname || 'avatar', {
        contentType: req.file.mimetype
      });
      uploadStream.end(req.file.buffer);
      await new Promise((resolve, reject) => {
        uploadStream.on('finish', resolve);
        uploadStream.on('error', reject);
      });
      newAvatarFileId = uploadStream.id;
    } else if (avatar === '') {
      removeAvatar = true;
    }

    // Explicitly update only allowed fields
    if (fullName !== undefined) userDoc.fullName = fullName.trim();
    if (normalizedEmail !== undefined) userDoc.email = normalizedEmail;
    if (phoneNumber !== undefined) userDoc.phoneNumber = phoneNumber.trim();
    
    const oldAvatarFileId = userDoc.avatarFileId;
    
    if (newAvatarFileId) {
      userDoc.avatarFileId = newAvatarFileId;
      // also clear legacy avatar path to prevent confusion
      userDoc.avatar = null; 
    } else if (removeAvatar) {
      userDoc.avatarFileId = null;
      userDoc.avatar = null;
    }
    
    await userDoc.save();
    
    // Delete old avatar from GridFS atomically after successful save
    if ((newAvatarFileId || removeAvatar) && oldAvatarFileId && bucket) {
      try {
        await bucket.delete(oldAvatarFileId);
      } catch (err) {
        console.error('Failed to delete old GridFS avatar:', err.message);
      }
    }
    
    // Clean up legacy local file if present and we're replacing/removing
    if ((newAvatarFileId || removeAvatar) && userDoc.avatar && userDoc.avatar.startsWith('/uploads/avatars/')) {
      const fs = require('fs');
      const path = require('path');
      const oldFile = path.join(__dirname, '../../../../../', userDoc.avatar);
      if (fs.existsSync(oldFile)) {
         try { fs.unlinkSync(oldFile); } catch (e) {}
      }
    }
    
    // Scrub passwordHash before sending back
    const userObj = userDoc.toObject();
    delete userObj.passwordHash;
    
    return sendSuccess(res, { message: 'Profile updated successfully', user: userObj });
  } catch (error) {
    next(error);
  }
};

exports.getAvatar = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const { fileId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).send('Invalid file ID');
    }
    
    // Verify file ID belongs to a user? Or is public ok?
    // Let's verify if the file belongs to any user. (Access control if required).
    const User = require('../models/User');
    const userWithAvatar = await User.findOne({ avatarFileId: fileId });
    if (!userWithAvatar) {
       return res.status(404).send('Avatar not found');
    }
    
    // Strict isolation: only the owner (or potentially an ADMIN/higher role) can retrieve it
    const reqUserId = req.user.id || req.user._id;
    if (userWithAvatar._id.toString() !== reqUserId.toString() && req.user.role !== 'ADMIN' && req.user.role !== 'PRINCIPAL' && req.user.role !== 'HOD') {
       return res.status(403).send('Forbidden: Access denied to this avatar.');
    }
    
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'avatars' });
    
    const files = await bucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).send('Avatar file not found');
    }
    
    const file = files[0];
    if (file.contentType) {
      res.set('Content-Type', file.contentType);
    }
    
    const downloadStream = bucket.openDownloadStream(file._id);
    downloadStream.on('error', (err) => {
      console.error('GridFS stream error:', err);
      if (!res.headersSent) res.status(500).send('Error streaming file');
    });
    
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error fetching avatar:', error);
    res.status(500).send('Internal Server Error');
  }
};
