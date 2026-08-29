const GuestLecture = require('../models/GuestLecture');
const Student = require('../../academic-master/models/Student');
const notificationService = require('./notification.service');

exports.create = async (data) => {
  const item = new GuestLecture(data);
  const saved = await item.save();

  // Trigger bulk notifications for target group (e.g. branchId + sectionId + year)
  let query = { campusId: saved.campusId };
  if (saved.branchId) query.branchId = saved.branchId;
  if (saved.year) query.year = saved.year;
  if (saved.sectionId) query.sectionId = saved.sectionId;

  const targetStudents = await Student.find(query).select('_id');
  const notificationPromises = targetStudents.map(student => 
    notificationService.createNotification(
      student._id,
      'GUEST_LECTURE',
      `A new Guest Lecture has been scheduled: ${saved.lecturerName}`,
      saved._id
    )
  );
  await Promise.all(notificationPromises);

  return saved;
};

exports.findAll = async () => {
  return await GuestLecture.find();
};

exports.findById = async (id) => {
  return await GuestLecture.findById(id);
};

exports.update = async (id, data) => {
  return await GuestLecture.findByIdAndUpdate(id, data, { new: true });
};

exports.remove = async (id) => {
  return await GuestLecture.findByIdAndDelete(id);
};
