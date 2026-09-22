const RemedialClass = require('../models/RemedialClass');
const Student = require('../../academic-master/models/Student');
const User = require('../../academic-master/models/User');
const Backlog = require('../../results-backlogs/models/Backlog');
const notificationService = require('../../notifications/services/notification.service');

const sendRemedialNotifications = async (remedialClass, isUpdate = false) => {
  if (!remedialClass.eligibleStudentIds || remedialClass.eligibleStudentIds.length === 0) return;

  const users = await User.find({ 'scopeRef.type': 'Student', 'scopeRef.refId': { $in: remedialClass.eligibleStudentIds } });

  const notifications = users.map(u => ({
    recipientUserId: u._id,
    recipientRole: 'STUDENT',
    title: isUpdate ? 'Remedial Class Updated' : 'New Remedial Class Scheduled',
    message: `Topic: ${remedialClass.topic}. Venue: ${remedialClass.venue}. Date: ${new Date(remedialClass.date).toLocaleDateString()}. Time: ${remedialClass.startTime} - ${remedialClass.endTime}. Status: ${remedialClass.status}`,
    notificationType: 'REMEDIAL',
    referenceType: 'RemedialClass',
    referenceId: remedialClass._id
  }));

  if (remedialClass.createdBy) {
    notifications.push({
      recipientUserId: remedialClass.createdBy,
      recipientRole: 'COORDINATOR',
      title: isUpdate ? 'Remedial Class Updated' : 'New Remedial Class Scheduled',
      message: `Topic: ${remedialClass.topic}. Venue: ${remedialClass.venue}. Date: ${new Date(remedialClass.date).toLocaleDateString()}. Time: ${remedialClass.startTime} - ${remedialClass.endTime}. Status: ${remedialClass.status}`,
      notificationType: 'REMEDIAL',
      referenceType: 'RemedialClass',
      referenceId: remedialClass._id
    });
  }

  if (notifications.length > 0) {
    await notificationService.createBulkNotifications(notifications);
  }
};

exports.getEligibleStudents = async (req, res) => {
  try {
    const { subjectId, targetYear, targetSection } = req.query;

    if (!subjectId) {
      return res.status(400).json({ status: 'error', message: 'Subject ID is required to find eligible backlog students' });
    }

    const backlogs = await Backlog.find({ subjectId, status: 'ACTIVE' }).populate('academicSemesterId', 'semesterCode');
    const studentIdsWithBacklog = [...new Set(backlogs.map(b => b.studentId.toString()))];

    if (studentIdsWithBacklog.length === 0) {
      return res.status(200).json({ status: 'success', data: [] });
    }

    const studentQuery = { _id: { $in: studentIdsWithBacklog } };
    if (targetYear) studentQuery.year = targetYear;
    if (targetSection) studentQuery.sectionId = targetSection;

    const eligibleStudents = await Student.find(studentQuery)
      .populate('branchId', 'code name')
      .populate('sectionId', 'sectionName');

    // Attach backlog details for display
    const data = eligibleStudents.map(student => {
      const studentBacklogs = backlogs.filter(b => b.studentId.toString() === student._id.toString());
      return {
        ...student.toObject(),
        activeBacklogCount: studentBacklogs.length,
        backlogSemesters: [...new Set(studentBacklogs.map(b => b.academicSemesterId?.semesterCode || '-'))]
      };
    });

    res.status(200).json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message || 'Failed to fetch eligible students' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const classes = await RemedialClass.find()
      .populate('subjectId', 'subjectName subjectCode')
      .populate('eligibleStudentIds', 'name rollNo branchId year')
      .sort({ date: -1 });
    res.status(200).json({ status: 'success', data: classes });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch remedial classes' });
  }
};

exports.getForStudent = async (req, res) => {
  try {
    const studentId = req.user.scopeRef?.refId;
    if (!studentId) return res.status(400).json({ status: 'error', message: 'Student scope not found' });
    
    const classes = await RemedialClass.find({ eligibleStudentIds: studentId })
      .populate('subjectId', 'subjectName subjectCode')
      .sort({ date: -1 });
      
    res.status(200).json({ status: 'success', data: classes });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch student remedial classes' });
  }
};

exports.create = async (req, res) => {
  try {
    const payload = { ...req.body, createdBy: req.user._id, updatedBy: req.user._id };
    
    // Time validation
    if (payload.startTime >= payload.endTime) {
      return res.status(400).json({ status: 'error', message: 'End time must be later than start time.' });
    }

    if (!payload.subjectId) {
      return res.status(400).json({ status: 'error', message: 'Subject ID is required.' });
    }

    const backlogs = await Backlog.find({ subjectId: payload.subjectId, status: 'ACTIVE' });
    payload.eligibleStudentIds = [...new Set(backlogs.map(b => b.studentId.toString()))];

    if (!payload.eligibleStudentIds || payload.eligibleStudentIds.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No eligible active backlog students found for this subject.' });
    }

    const newClass = new RemedialClass(payload);
    await newClass.save();

    await sendRemedialNotifications(newClass, false);

    res.status(201).json({ status: 'success', data: newClass });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message || 'Failed to create remedial class' });
  }
};

exports.update = async (req, res) => {
  try {
    const oldClass = await RemedialClass.findById(req.params.id);
    if (!oldClass) return res.status(404).json({ status: 'error', message: 'Not found' });

    const payload = { ...req.body, updatedBy: req.user._id };

    if (payload.startTime && payload.endTime && payload.startTime >= payload.endTime) {
      return res.status(400).json({ status: 'error', message: 'End time must be later than start time.' });
    }

    if (payload.subjectId && payload.subjectId !== oldClass.subjectId?.toString()) {
      const backlogs = await Backlog.find({ subjectId: payload.subjectId, status: 'ACTIVE' });
      payload.eligibleStudentIds = [...new Set(backlogs.map(b => b.studentId.toString()))];
      
      if (!payload.eligibleStudentIds || payload.eligibleStudentIds.length === 0) {
        return res.status(400).json({ status: 'error', message: 'No eligible active backlog students found for this subject.' });
      }
    }

    const updatedClass = await RemedialClass.findByIdAndUpdate(req.params.id, payload, { new: true });
    
    const changed = 
      new Date(oldClass.date).getTime() !== new Date(updatedClass.date).getTime() ||
      oldClass.startTime !== updatedClass.startTime ||
      oldClass.endTime !== updatedClass.endTime ||
      oldClass.venue !== updatedClass.venue ||
      oldClass.topic !== updatedClass.topic ||
      oldClass.status !== updatedClass.status ||
      oldClass.facultyName !== updatedClass.facultyName ||
      oldClass.subjectId?.toString() !== updatedClass.subjectId?.toString();

    if (changed) {
      await sendRemedialNotifications(updatedClass, true);
    }

    res.status(200).json({ status: 'success', data: updatedClass });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to update remedial class' });
  }
};

exports.delete = async (req, res) => {
  try {
    const deletedClass = await RemedialClass.findByIdAndDelete(req.params.id);
    if (!deletedClass) return res.status(404).json({ status: 'error', message: 'Not found' });
    
    // Cancellation notification
    if (deletedClass.eligibleStudentIds && deletedClass.eligibleStudentIds.length > 0) {
      const users = await User.find({ 'scopeRef.type': 'Student', 'scopeRef.refId': { $in: deletedClass.eligibleStudentIds } });
      const notifications = users.map(u => ({
        recipientUserId: u._id,
        recipientRole: 'STUDENT',
        title: 'Remedial Class Cancelled',
        message: `The remedial class scheduled for ${new Date(deletedClass.date).toLocaleDateString()} has been cancelled.`,
        notificationType: 'REMEDIAL',
        referenceType: 'RemedialClass',
        referenceId: deletedClass._id
      }));
      
      if (deletedClass.createdBy) {
        notifications.push({
          recipientUserId: deletedClass.createdBy,
          recipientRole: 'COORDINATOR',
          title: 'Remedial Class Cancelled',
          message: `The remedial class scheduled for ${new Date(deletedClass.date).toLocaleDateString()} has been cancelled.`,
          notificationType: 'REMEDIAL',
          referenceType: 'RemedialClass',
          referenceId: deletedClass._id
        });
      }

      if (notifications.length > 0) {
        await notificationService.createBulkNotifications(notifications);
      }
    }
    
    res.status(200).json({ status: 'success', message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to delete remedial class' });
  }
};
