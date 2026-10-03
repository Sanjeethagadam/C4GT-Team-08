const RiskProfile = require('../models/RiskProfile');
const RiskConfig = require('../models/RiskConfig');
const Student = require('../../academic-master/models/Student');
const riskService = require('../services/risk.service');

exports.getRiskProfiles = async (req, res) => {
  try {
    const { sectionId, branchId, academicYearId, academicSemesterId } = req.query;

    let studentQuery = {};
    if (sectionId) studentQuery.sectionId = sectionId;
    if (branchId) studentQuery.branchId = branchId;
    if (academicYearId) studentQuery.academicYearId = academicYearId;

    let students = [];
    if (Object.keys(studentQuery).length > 0) {
      students = await Student.find(studentQuery).select('_id name rollNo');
    } else {
      students = await Student.find().select('_id name rollNo');
    }

    const studentIds = students.map(s => s._id);

    // If academicSemesterId is not provided, we might just query the latest ones, but for simplicity we can require it or default.
    // However, if we need to return risk profiles, we might just query RiskProfile for these students.
    // Or we recalculate on the fly to ensure freshness if not many.
    
    // For now, let's just recalculate for the students in scope if academicSemesterId is provided, 
    // otherwise just fetch existing ones.
    
    let profileQuery = { studentId: { $in: studentIds } };
    if (academicSemesterId) {
      profileQuery.academicSemesterId = academicSemesterId;
      // Recalculate on the fly for the scope (configurable engine requirement: always fresh based on config)
      for (const student of students) {
        await riskService.calculateRiskForStudent(student._id, academicSemesterId);
      }
    }

    const profiles = await RiskProfile.find(profileQuery).populate({
      path: 'studentId',
      select: 'name rollNo'
    });

    res.status(200).json({ status: 'success', data: profiles });
  } catch (err) {
    console.error('getRiskProfiles error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch risk profiles' });
  }
};

exports.getConfig = async (req, res) => {
  try {
    const configs = await RiskConfig.find();
    res.status(200).json({ status: 'success', data: configs });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch risk configuration' });
  }
};

exports.updateConfig = async (req, res) => {
  try {
    const { indicator, thresholds, isActive } = req.body;
    const config = await RiskConfig.findOneAndUpdate(
      { indicator },
      { thresholds, isActive },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(200).json({ status: 'success', data: config });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to update risk configuration' });
  }
};
