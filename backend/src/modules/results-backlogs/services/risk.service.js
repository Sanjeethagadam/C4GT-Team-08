const RiskConfig = require('../models/RiskConfig');
const RiskProfile = require('../models/RiskProfile');
const Backlog = require('../models/Backlog');
const SemesterResult = require('../models/SemesterResult');

class RiskService {
  /**
   * Calculates the risk profile for a given student in a given semester based on configurations.
   * If configurations are missing or inactive, defaults to NOT_CONFIGURED.
   */
  async calculateRiskForStudent(student, academicSemesterId) {
    const studentId = student._id || student;

    const backlogConfig = await RiskConfig.findOne({ indicator: 'BACKLOGS', isActive: true });
    const internalMarksConfig = await RiskConfig.findOne({ indicator: 'INTERNAL_MARKS', isActive: true });

    let riskLevel = 'NOT_CONFIGURED';
    let factors = [];
    
    let isConfigured = false;
    let highestSeverity = 0; // 0 = LOW, 1 = MEDIUM, 2 = HIGH, 3 = CRITICAL

    const getSeverity = (level) => {
      switch(level) {
        case 'LOW': return 0;
        case 'MEDIUM': return 1;
        case 'HIGH': return 2;
        case 'CRITICAL': return 3;
        default: return -1;
      }
    };

    const setHighestRisk = (level, factorMsg) => {
      isConfigured = true;
      const sev = getSeverity(level);
      if (sev >= highestSeverity) {
        highestSeverity = sev;
        riskLevel = level;
      }
      factors.push(factorMsg);
    };

    if (backlogConfig && backlogConfig.thresholds) {
      const activeBacklogs = await Backlog.countDocuments({ studentId, status: 'ACTIVE' });
      
      let matchedLevel = null;
      // We assume threshold specifies >= for backlogs (e.g., if CRITICAL is 5, then >= 5 is CRITICAL)
      // Check from highest to lowest severity
      const t = backlogConfig.thresholds;
      
      if (t.CRITICAL !== undefined && activeBacklogs >= t.CRITICAL) matchedLevel = 'CRITICAL';
      else if (t.HIGH !== undefined && activeBacklogs >= t.HIGH) matchedLevel = 'HIGH';
      else if (t.MEDIUM !== undefined && activeBacklogs >= t.MEDIUM) matchedLevel = 'MEDIUM';
      else if (t.LOW !== undefined && activeBacklogs >= t.LOW) matchedLevel = 'LOW';

      if (matchedLevel) {
        setHighestRisk(matchedLevel, `${activeBacklogs} Active Backlog(s)`);
      } else {
        // Even if 0 backlogs, we consider it evaluated.
        isConfigured = true;
      }
    }

    if (internalMarksConfig && internalMarksConfig.thresholds) {
      const results = await SemesterResult.find({ studentId, academicSemesterId });
      
      let lowestMark = Infinity;
      results.forEach(r => {
         const mark = parseInt(r.internalMarks, 10);
         if (!isNaN(mark) && mark < lowestMark) {
           lowestMark = mark;
         }
      });

      if (lowestMark !== Infinity) {
        let matchedLevel = null;
        const t = internalMarksConfig.thresholds;
        
        // For marks, threshold is usually <= (e.g. CRITICAL if <= 5)
        if (t.CRITICAL !== undefined && lowestMark <= t.CRITICAL) matchedLevel = 'CRITICAL';
        else if (t.HIGH !== undefined && lowestMark <= t.HIGH) matchedLevel = 'HIGH';
        else if (t.MEDIUM !== undefined && lowestMark <= t.MEDIUM) matchedLevel = 'MEDIUM';
        else if (t.LOW !== undefined && lowestMark <= t.LOW) matchedLevel = 'LOW';

        if (matchedLevel) {
          setHighestRisk(matchedLevel, `Low Internal Marks (Min: ${lowestMark})`);
        } else {
          isConfigured = true;
        }
      } else {
        // If no results, we still say it's configured just no data.
        if (internalMarksConfig) isConfigured = true;
      }
    }

    // If neither config was present/active, fallback
    if (!isConfigured) {
      riskLevel = 'NOT_CONFIGURED';
      factors = ['No risk configurations defined'];
    } else if (factors.length === 0) {
      // Configured but no thresholds hit => LOW risk
      riskLevel = 'LOW';
      factors = ['No academic risk factors detected'];
    }

    const prevProfile = await RiskProfile.findOne({ studentId, academicSemesterId });
    const previousLevel = prevProfile ? prevProfile.riskLevel : null;

    // Upsert the calculated profile
    const profile = await RiskProfile.findOneAndUpdate(
      { studentId, academicSemesterId },
      { riskLevel, factors },
      { upsert: true, new: true }
    );

    // Notification Logic: Transition to HIGH or CRITICAL
    if ((riskLevel === 'HIGH' || riskLevel === 'CRITICAL') && riskLevel !== previousLevel) {
      const User = require('../../academic-master/models/User');
      const Student = require('../../academic-master/models/Student');
      const notificationService = require('../../notifications/services/notification.service');
      
      const st = await Student.findById(studentId);
      if (st) {
        // Find Student User
        const studentUser = await User.findOne({ 'scopeRef.type': 'Student', 'scopeRef.refId': studentId });
        
        // Find HOD
        const hods = await User.find({ role: 'HOD', 'scopeRef.type': 'Branch', 'scopeRef.refId': st.branchId });
        
        // Find CTPO
        const ctpos = await User.find({ role: 'CTPO' }); // CTPOs are global or campus scoped, we fetch all for now or specific to campus
        
        const notificationData = {
          title: `Academic Risk Alert: ${riskLevel}`,
          message: `Risk level for ${st.name} (${st.rollNo}) has transitioned to ${riskLevel}. Factors: ${factors.join(', ')}`,
          notificationType: 'RISK',
          referenceType: 'RiskProfile',
          referenceId: profile._id
        };

        const notifications = [];
        
        if (studentUser) {
          notifications.push({ ...notificationData, recipientUserId: studentUser._id, recipientRole: 'STUDENT' });
        }
        
        hods.forEach(hod => {
          notifications.push({ ...notificationData, recipientUserId: hod._id, recipientRole: 'HOD' });
        });
        
        ctpos.forEach(ctpo => {
          // Verify scope if campus specific
          if (!ctpo.scopeRef || !ctpo.scopeRef.type || (ctpo.scopeRef.type === 'Campus' && ctpo.scopeRef.refId.toString() === st.campusId.toString())) {
             notifications.push({ ...notificationData, recipientUserId: ctpo._id, recipientRole: 'CTPO' });
          }
        });

        await notificationService.createBulkNotifications(notifications);
      }
    }

    return profile;
  }
}

module.exports = new RiskService();
