const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/response.util');
const CtpoAssignment = require('../modules/examination/models/CtpoAssignment');

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // We will attach decoded user info to req.user.
      req.user = decoded;
      
      // --- ENFORCE CTPO SCOPE GLOBALLY ---
      if (req.user.role === 'CTPO') {
        const assignment = await CtpoAssignment.findOne({ ctpoUserId: req.user.id || req.user._id, status: 'ACTIVE' }).populate('semesterId');
        if (!assignment) {
          return sendError(res, 'Not authorized, CTPO assignment inactive or missing', 403);
        }
        
        req.ctpoAssignment = assignment;
        const branchId = assignment.branchId.toString();
        const year = assignment.semesterId.year;
        const semesterId = assignment.semesterId._id.toString();
        
        // Force override queries
        req.query.branchId = branchId;
        req.query.year = year.toString();
        req.query.semesterId = semesterId;

        // Force override body fields
        if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
          req.body.branchId = branchId;
          req.body.year = year;
          req.body.semesterId = semesterId;
        }
      }

      // --- ACTIVE USERS TRACKING ---
      // Update lastActiveAt if it's been more than 1 minute
      const User = require('../modules/academic-master/models/User');
      const userDoc = await User.findById(req.user.id || req.user._id);
      if (userDoc) {
        const now = new Date();
        if (!userDoc.lastActiveAt || (now - userDoc.lastActiveAt) > 60 * 1000) {
          userDoc.lastActiveAt = now;
          await userDoc.save({ validateModifiedOnly: true });
        }
      }

      return next();
    } catch (error) {
      console.error('Auth Middleware Error:', error);
      return sendError(res, 'Not authorized, token failed', 401);
    }
  }

  if (!token) {
    return sendError(res, 'Not authorized, no token', 401);
  }
};

module.exports = { protect };
