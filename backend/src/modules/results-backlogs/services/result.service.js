const Result = require('../models/Result');
const Backlog = require('../models/Backlog');

exports.create = async (data) => {
  return await this.processResult(data);
};

exports.processResult = async (data) => {
  // 1. Create the official result
  const result = new Result(data);
  const savedResult = await result.save();

  // 2. Backlog business logic
  if (savedResult.resultStatus === 'FAIL' || savedResult.resultStatus === 'ABSENT') {
    // Check if an ACTIVE backlog already exists
    const existing = await Backlog.findOne({
      studentId: savedResult.studentId,
      subjectId: savedResult.subjectId,
      status: 'ACTIVE'
    });
    
    if (!existing) {
      const newBacklog = await Backlog.create({
        studentId: savedResult.studentId,
        subjectId: savedResult.subjectId,
        semesterId: savedResult.semesterId,
        resultId: savedResult._id,
        status: 'ACTIVE'
      });
      
      // Auto-trigger notification for new backlog
      const notificationService = require('../../academic-support/services/notification.service');
      await notificationService.createNotification(
        newBacklog.studentId,
        'BACKLOG',
        'You have received a new Backlog for this subject.',
        newBacklog._id
      );
    }
  } else if (savedResult.resultStatus === 'PASS') {
    // If student passed, clear any ACTIVE backlog for this subject
    await Backlog.updateMany(
      { studentId: savedResult.studentId, subjectId: savedResult.subjectId, status: 'ACTIVE' },
      { status: 'CLEARED' }
    );
  }

  // 3. Trigger risk recalculation hook
  const riskProfileService = require('./riskProfile.service');
  await riskProfileService.recalculate(savedResult.studentId);

  return savedResult;
};

exports.findAll = async () => {
  return await Result.find();
};

exports.findById = async (id) => {
  return await Result.findById(id);
};

exports.update = async (id, data) => {
  return await Result.findByIdAndUpdate(id, data, { new: true });
};

exports.remove = async (id) => {
  return await Result.findByIdAndDelete(id);
};
