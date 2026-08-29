const RemedialStudent = require('../models/RemedialStudent');
const RemedialClass = require('../models/RemedialClass');
const Backlog = require('../../results-backlogs/models/Backlog');
const notificationService = require('./notification.service');

exports.create = async (data) => {
  // 1. Verify Remedial Class exists to find subjectId
  const rClass = await RemedialClass.findById(data.remedialClassId);
  if (!rClass) throw new Error('Remedial Class not found');

  // 2. Verify eligibility: student must have an ACTIVE backlog for this subject
  const backlog = await Backlog.findOne({
    studentId: data.studentId,
    subjectId: rClass.subjectId,
    status: 'ACTIVE'
  });
  
  if (!backlog) {
    throw new Error('Ineligible: Student does not have an active backlog for this subject');
  }

  // 3. Create assignment
  const item = new RemedialStudent(data);
  const saved = await item.save();

  // 4. Trigger Notification
  await notificationService.createNotification(
    saved.studentId,
    'REMEDIAL',
    'You have been assigned to a Remedial Class.',
    saved._id
  );

  return saved;
};

exports.findAll = async () => {
  return await RemedialStudent.find();
};

exports.findById = async (id) => {
  return await RemedialStudent.findById(id);
};

exports.update = async (id, data) => {
  return await RemedialStudent.findByIdAndUpdate(id, data, { new: true });
};

exports.remove = async (id) => {
  return await RemedialStudent.findByIdAndDelete(id);
};
