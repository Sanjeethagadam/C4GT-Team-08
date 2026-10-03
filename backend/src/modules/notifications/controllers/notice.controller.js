const Notice = require('../models/Notice');
const Notification = require('../models/Notification');
const User = require('../../academic-master/models/User');
const Student = require('../../academic-master/models/Student');
const CtpoAssignment = require('../../examination/models/CtpoAssignment');
const Semester = require('../../academic-master/models/Semester');
const auditService = require('../../audit/services/audit.service');

exports.uploadNotice = async (req, res, next) => {
  try {
    const { title, noticeType, description, targetBranches, targetYears, videoUrl } = req.body;
    if (!title || !noticeType) {
      return res.status(400).json({ success: false, message: 'Title and noticeType are required' });
    }

    let finalBranches = [];
    let finalYears = [];
    let academicYearId = null;

    if (req.user.role === 'CTPO') {
      // Force targeting to CTPO scope
      const assignment = await CtpoAssignment.findOne({ ctpoUserId: req.user.id || req.user._id, status: 'ACTIVE' })
        .populate('semesterId');
      
      if (!assignment) {
        return res.status(403).json({ success: false, message: 'No active CTPO assignment found' });
      }

      finalBranches = [assignment.branchId];
      finalYears = [assignment.semesterId.year];
      academicYearId = assignment.academicYearId;
    } else if (req.user.role === 'ADMIN' || req.user.role === 'PRINCIPAL') {
      // Allow broader targeting
      if (targetBranches) {
         finalBranches = Array.isArray(targetBranches) ? targetBranches : JSON.parse(targetBranches);
      }
      if (targetYears) {
         finalYears = Array.isArray(targetYears) ? targetYears.map(Number) : JSON.parse(targetYears).map(Number);
      }
      // Need a valid academicYearId. Let's just pick the latest active one
      const currentYear = await require('../../academic-master/models/AcademicYear').findOne({ isCurrent: true });
      if (currentYear) academicYearId = currentYear._id;
    } else {
      return res.status(403).json({ success: false, message: 'Unauthorized role for uploading notices' });
    }

    const notice = await Notice.create({
      title,
      noticeType,
      description,
      documentPath: req.file ? req.file.filename : undefined,
      videoUrl,
      uploadedBy: req.user.id || req.user._id,
      targetBranches: finalBranches,
      targetYears: finalYears,
      academicYearId,
      isPublished: false
    });

    await auditService.logAction({
      actor: req.user.id || req.user._id,
      role: req.user.role,
      action: 'NOTICE_UPLOADED',
      entityType: 'Notice',
      entityId: notice._id,
      reason: `Uploaded ${noticeType}`,
      timestamp: new Date()
    });

    return res.status(201).json({ success: true, data: { message: 'Notice uploaded successfully. Ready for publish.', notice } });
  } catch (error) {
    next(error);
  }
};

exports.getNotices = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'CTPO') {
      const assignment = await CtpoAssignment.findOne({ ctpoUserId: req.user.id || req.user._id, status: 'ACTIVE' })
        .populate('semesterId');
      if (!assignment) return res.status(403).json({ success: false, message: 'No active CTPO assignment found' });
      
      // CTPO only sees notices targeting their exact branch and year
      query = { 
        targetBranches: assignment.branchId,
        targetYears: assignment.semesterId.year
      };
    } else if (req.user.role === 'STUDENT') {
       // Students only see published notices targeting their branch and year
       const studentUser = await User.findById(req.user.id || req.user._id);
       const student = await Student.findById(studentUser.scopeRef.refId);
       
       query = {
         isPublished: true,
         $or: [
           { targetBranches: { $size: 0 } },
           { targetBranches: student.branchId }
         ],
         $and: [
           {
             $or: [
               { targetYears: { $size: 0 } },
               { targetYears: student.year }
             ]
           }
         ]
       };
    }

    const notices = await Notice.find(query).sort({ createdAt: -1 }).lean();

    return res.status(200).json({ success: true, data: notices });
  } catch (error) {
    next(error);
  }
};

exports.publishNotice = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Authorization check
    let notice;
    if (req.user.role === 'CTPO') {
      const assignment = await CtpoAssignment.findOne({ ctpoUserId: req.user.id || req.user._id, status: 'ACTIVE' })
        .populate('semesterId');
      if (!assignment) return res.status(403).json({ success: false, message: 'No active CTPO assignment found' });
      
      notice = await Notice.findOne({
        _id: id,
        targetBranches: assignment.branchId,
        targetYears: assignment.semesterId.year
      });
    } else {
      notice = await Notice.findOne({ _id: id });
    }

    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found or unauthorized' });
    if (notice.isPublished) return res.status(400).json({ success: false, message: 'Notice is already published' });

    // Broadcast notifications to all matching active students
    let studentQuery = {};
    if (notice.targetBranches && notice.targetBranches.length > 0) {
      studentQuery.branchId = { $in: notice.targetBranches };
    }
    if (notice.targetYears && notice.targetYears.length > 0) {
      studentQuery.year = { $in: notice.targetYears };
    }

    const students = await Student.find(studentQuery).select('_id').lean();
    const studentIds = students.map(s => s._id);

    const studentUsers = await User.find({ 'scopeRef.refId': { $in: studentIds }, role: 'STUDENT', status: 'ACTIVE' }).select('_id').lean();
    console.log('Publish Notice Debug -> id:', id, 'studentQuery:', JSON.stringify(studentQuery), 'students count:', students.length, 'users count:', studentUsers.length);
    
    // If this is just an estimation request
    if (req.query.estimate === 'true') {
      return res.status(200).json({ success: true, data: { estimatedCount: studentUsers.length } });
    }

    notice.isPublished = true;
    await notice.save();
    
    // Check for existing notifications to avoid duplicates
    const existingNotifs = await Notification.find({
      recipientUserId: { $in: studentUsers.map(u => u._id) },
      referenceId: notice._id,
      referenceType: 'Notice'
    }).select('recipientUserId').lean();
    
    const existingIds = new Set(existingNotifs.map(n => n.recipientUserId.toString()));

    const notificationsToCreate = [];
    let duplicatesSkipped = 0;

    studentUsers.forEach(u => {
      if (existingIds.has(u._id.toString())) {
        duplicatesSkipped++;
      } else {
        notificationsToCreate.push({
          recipientUserId: u._id,
          recipientRole: 'STUDENT',
          title: notice.title,
          message: notice.description || `New ${notice.noticeType} published.`,
          notificationType: 'SYSTEM',
          referenceType: 'Notice',
          referenceId: notice._id
        });
      }
    });

    if (notificationsToCreate.length > 0) {
      await Notification.bulkWrite(notificationsToCreate.map(n => ({ insertOne: { document: n } })));
    }

    await auditService.logAction({
      actor: req.user.id || req.user._id,
      role: req.user.role,
      action: 'NOTICE_PUBLISHED',
      entityType: 'Notice',
      entityId: notice._id,
      reason: `Published notice targeting ${studentUsers.length} students`,
      timestamp: new Date()
    });

    return res.status(200).json({ 
      success: true, 
      data: { 
        message: `Notice published successfully.`,
        stats: {
          targeted: studentUsers.length,
          created: notificationsToCreate.length,
          duplicatesSkipped
        },
        notice 
      } 
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteNotice = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    let notice;
    if (req.user.role === 'CTPO') {
      const assignment = await CtpoAssignment.findOne({ ctpoUserId: req.user.id || req.user._id, status: 'ACTIVE' }).populate('semesterId');
      if (!assignment) return res.status(403).json({ success: false, message: 'No active CTPO assignment found' });
      notice = await Notice.findOneAndDelete({ _id: id, targetBranches: assignment.branchId, targetYears: assignment.semesterId.year });
    } else {
      notice = await Notice.findOneAndDelete({ _id: id });
    }

    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found or unauthorized' });

    // Also delete associated notifications
    await Notification.deleteMany({ referenceType: 'Notice', referenceId: id });

    await auditService.logAction({
      actor: req.user.id || req.user._id,
      role: req.user.role,
      action: 'NOTICE_DELETED',
      entityType: 'Notice',
      entityId: id,
      reason: `Deleted notice ${notice.title}`,
      timestamp: new Date()
    });

    return res.status(200).json({ success: true, data: { message: 'Notice deleted successfully' } });
  } catch (error) {
    next(error);
  }
};

exports.unpublishNotice = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    let notice;
    if (req.user.role === 'CTPO') {
      const assignment = await CtpoAssignment.findOne({ ctpoUserId: req.user.id || req.user._id, status: 'ACTIVE' }).populate('semesterId');
      if (!assignment) return res.status(403).json({ success: false, message: 'No active CTPO assignment found' });
      notice = await Notice.findOne({ _id: id, targetBranches: assignment.branchId, targetYears: assignment.semesterId.year });
    } else {
      notice = await Notice.findOne({ _id: id });
    }

    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found or unauthorized' });
    if (!notice.isPublished) return res.status(400).json({ success: false, message: 'Notice is not published' });

    notice.isPublished = false;
    await notice.save();

    await auditService.logAction({
      actor: req.user.id || req.user._id,
      role: req.user.role,
      action: 'NOTICE_UNPUBLISHED',
      entityType: 'Notice',
      entityId: notice._id,
      reason: `Unpublished notice ${notice.title}`,
      timestamp: new Date()
    });

    return res.status(200).json({ success: true, data: { message: 'Notice unpublished successfully', notice } });
  } catch (error) {
    next(error);
  }
};

exports.getNoticeStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    let notice;
    if (req.user.role === 'CTPO') {
      const assignment = await CtpoAssignment.findOne({ ctpoUserId: req.user.id || req.user._id, status: 'ACTIVE' }).populate('semesterId');
      if (!assignment) return res.status(403).json({ success: false, message: 'No active CTPO assignment found' });
      notice = await Notice.findOne({ _id: id, targetBranches: assignment.branchId, targetYears: assignment.semesterId.year });
    } else {
      notice = await Notice.findOne({ _id: id });
    }

    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found or unauthorized' });

    const totalTargeted = await Notification.countDocuments({ referenceType: 'Notice', referenceId: id });
    const viewed = await Notification.countDocuments({ referenceType: 'Notice', referenceId: id, isRead: true });
    
    const notViewed = totalTargeted - viewed;
    const viewPercentage = totalTargeted > 0 ? ((viewed / totalTargeted) * 100).toFixed(1) : 0;

    return res.status(200).json({ 
      success: true, 
      data: { 
        totalTargeted,
        viewed,
        notViewed,
        viewPercentage
      } 
    });
  } catch (error) {
    next(error);
  }
};

exports.downloadNotice = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Authorization check
    let notice;
    if (req.user.role === 'CTPO') {
      const assignment = await CtpoAssignment.findOne({ ctpoUserId: req.user.id || req.user._id, status: 'ACTIVE' }).populate('semesterId');
      if (!assignment) return res.status(403).json({ success: false, message: 'No active CTPO assignment found' });
      notice = await Notice.findOne({ _id: id, targetBranches: assignment.branchId, targetYears: assignment.semesterId.year });
    } else if (req.user.role === 'STUDENT') {
       const studentUser = await User.findById(req.user.id || req.user._id);
       const student = await Student.findById(studentUser.scopeRef.refId);
       
       notice = await Notice.findOne({
         _id: id,
         isPublished: true,
         $or: [
           { targetBranches: { $size: 0 } },
           { targetBranches: student.branchId }
         ],
         $and: [
           {
             $or: [
               { targetYears: { $size: 0 } },
               { targetYears: student.year }
             ]
           }
         ]
       });
    } else {
      notice = await Notice.findOne({ _id: id });
    }

    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found or unauthorized' });

    const path = require('path');
    const fs = require('fs');
    const filePath = path.join(__dirname, '../../../../uploads/notices', notice.documentPath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server' });
    }

    // Set correct headers for PDF viewing in browser
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${notice.documentPath}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
};
