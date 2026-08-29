const RiskProfile = require('../models/RiskProfile');
const RiskThreshold = require('../models/RiskThreshold');
const Backlog = require('../models/Backlog');

exports.create = async (data) => {
  const item = new RiskProfile(data);
  return await item.save();
};

exports.recalculate = async (studentId) => {
  // Fetch threshold configurations
  const thresholds = await RiskThreshold.find();
  const getThreshold = (key, defaultVal) => {
    const t = thresholds.find(t => t.key === key);
    return t ? t.value : defaultVal;
  };

  const highRiskBacklogs = getThreshold('HIGH_RISK_BACKLOGS', 3);
  const mediumRiskBacklogs = getThreshold('MEDIUM_RISK_BACKLOGS', 1);

  // Calculate current state
  const activeBacklogsCount = await Backlog.countDocuments({ studentId, status: 'ACTIVE' });

  // Evaluate risk level
  let riskLevel = 'LOW';
  let indicators = [];

  if (activeBacklogsCount >= highRiskBacklogs) {
    riskLevel = 'HIGH';
    indicators.push(`${activeBacklogsCount} Active Backlogs`);
  } else if (activeBacklogsCount >= mediumRiskBacklogs) {
    riskLevel = 'MEDIUM';
    indicators.push(`${activeBacklogsCount} Active Backlogs`);
  }

  // Update profile
  return await RiskProfile.findOneAndUpdate(
    { studentId },
    { riskLevel, indicators, updatedAt: new Date() },
    { new: true, upsert: true }
  );
};

exports.findAll = async () => {
  return await RiskProfile.find();
};

exports.findById = async (id) => {
  return await RiskProfile.findById(id);
};

exports.update = async (id, data) => {
  return await RiskProfile.findByIdAndUpdate(id, data, { new: true });
};

exports.remove = async (id) => {
  return await RiskProfile.findByIdAndDelete(id);
};
