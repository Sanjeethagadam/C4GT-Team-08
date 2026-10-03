const GuestLecture = require('../models/GuestLecture');
const Student = require('../../academic-master/models/Student');
const User = require('../../academic-master/models/User');
const Subject = require('../../academic-master/models/Subject');
const notificationService = require('../../notifications/services/notification.service');


const sendGuestLectureNotifications = async (lecture, isUpdate = false) => {
  if (!lecture.eligibleStudentIds || lecture.eligibleStudentIds.length === 0) return;

  const users = await User.find({ 'scopeRef.type': 'Student', 'scopeRef.refId': { $in: lecture.eligibleStudentIds } });

  let subjectName = lecture.customSubjectName || '';
  if (lecture.subjectId) {
    const sub = await Subject.findById(lecture.subjectId);
    if (sub) subjectName = sub.subjectName;
  }

  const notifications = users.map(u => ({
    recipientUserId: u._id,
    recipientRole: 'STUDENT',
    title: isUpdate ? 'Guest Lecture Updated' : 'New Guest Lecture Scheduled',
    message: `Subject: ${subjectName}. Topic: ${lecture.topic}. Speaker: ${lecture.speakerName}. Venue: ${lecture.venue}. Date: ${new Date(lecture.date).toLocaleDateString()}. Time: ${lecture.startTime} - ${lecture.endTime}. Status: ${lecture.status}`,
    notificationType: 'GUEST_LECTURE',
    referenceType: 'GuestLecture',
    referenceId: lecture._id
  }));

  if (lecture.createdBy) {
    notifications.push({
      recipientUserId: lecture.createdBy,
      recipientRole: 'COORDINATOR',
      title: isUpdate ? 'Guest Lecture Updated' : 'New Guest Lecture Scheduled',
      message: `Subject: ${subjectName}. Topic: ${lecture.topic}. Speaker: ${lecture.speakerName}. Venue: ${lecture.venue}. Date: ${new Date(lecture.date).toLocaleDateString()}. Time: ${lecture.startTime} - ${lecture.endTime}. Status: ${lecture.status}`,
      notificationType: 'GUEST_LECTURE',
      referenceType: 'GuestLecture',
      referenceId: lecture._id
    });
  }

  if (notifications.length > 0) {
    await notificationService.createBulkNotifications(notifications);
  }
};


exports.getTargetStudents = async (req, res) => {
  try {
    const { targetBranches, targetYear, targetSemester, targetSection, subjectId } = req.query;

    const query = {};
    
    // Convert comma separated strings to array if needed
    if (targetBranches) {
      const branches = Array.isArray(targetBranches) ? targetBranches : targetBranches.split(',');
      if (branches.length > 0 && branches[0] !== '') {
        query.branchId = { $in: branches };
      }
    }
    
    if (targetYear) {
      const years = Array.isArray(targetYear) ? targetYear : targetYear.split(',');
      if (years.length > 0 && years[0] !== '') {
        query.year = { $in: years.map(Number) };
      }
    }
    if (targetSection) query.sectionId = targetSection;
    
    if (targetYear && targetSemester) {
      const Semester = require('../../academic-master/models/Semester');
      const years = Array.isArray(targetYear) ? targetYear : targetYear.split(',');
      const semIds = [];
      for (const y of years) {
        if (y !== '') {
          const semesterCode = `${y}-${targetSemester}`;
          const sems = await Semester.find({ semesterCode });
          sems.forEach(s => semIds.push(s._id));
        }
      }
      if (semIds.length > 0) {
        query.semesterId = { $in: semIds };
      } else {
        query.semesterId = null;
      }
    }

    let students = await Student.find(query)
      .populate('branchId', 'code name')
      .populate('sectionId', 'sectionName');

    if (subjectId) {
      const SubjectBranchMapping = require('../../academic-master/models/SubjectBranchMapping');
      const sbmDocs = await SubjectBranchMapping.find({ subjectId });
      const validBranchIds = sbmDocs.map(s => s.branchId.toString());
      students = students.filter(s => s.branchId && validBranchIds.includes(s.branchId._id.toString()));
    }

    res.status(200).json({ status: 'success', data: students });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch target students' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const lectures = await GuestLecture.find()
      .populate('subjectId', 'subjectName subjectCode')
      .populate('targetBranches', 'code name')
      .populate('targetSection', 'sectionName')
      .populate('eligibleStudentIds', 'name rollNo branchId year')
      .sort({ date: -1 });
    res.status(200).json({ status: 'success', data: lectures });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch guest lectures' });
  }
};

exports.getForStudent = async (req, res) => {
  try {
    const studentId = req.user.scopeRef?.refId;
    if (!studentId) return res.status(400).json({ status: 'error', message: 'Student scope not found' });

    const lectures = await GuestLecture.find({ eligibleStudentIds: studentId })
      .populate('subjectId', 'subjectName subjectCode')
      .sort({ date: -1 });
      
    res.status(200).json({ status: 'success', data: lectures });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch student guest lectures' });
  }
};

exports.create = async (req, res) => {
  try {
    const payload = { ...req.body, createdBy: req.user._id, updatedBy: req.user._id };
    
    if (payload.startTime >= payload.endTime) {
      return res.status(400).json({ status: 'error', message: 'End time must be later than start time.' });
    }

    // Auto calculate eligible students
    const query = {};
    if (payload.targetBranches && payload.targetBranches.length > 0) {
      query.branchId = { $in: payload.targetBranches };
    }
    if (payload.targetYear && payload.targetYear.length > 0) {
      const years = Array.isArray(payload.targetYear) ? payload.targetYear : [payload.targetYear];
      query.year = { $in: years.map(Number) };
    }
    if (payload.targetSection) query.sectionId = payload.targetSection;
    if (payload.targetSemester) {
        const Semester = require('../../academic-master/models/Semester');
        const years = Array.isArray(payload.targetYear) ? payload.targetYear : [payload.targetYear];
        const semIds = [];
        for (const y of years) {
            const semesterCode = `${y}-${payload.targetSemester}`;
            const sems = await Semester.find({ semesterCode });
            sems.forEach(s => semIds.push(s._id));
        }
        if (semIds.length > 0) query.semesterId = { $in: semIds };
    }

    const targetStudents = await Student.find(query).select('_id');
    payload.eligibleStudentIds = targetStudents.map(s => s._id);

    if (!payload.eligibleStudentIds || payload.eligibleStudentIds.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No target students found for the selected criteria.' });
    }

    const newLecture = new GuestLecture(payload);
    await newLecture.save();

    await sendGuestLectureNotifications(newLecture, false);

    res.status(201).json({ status: 'success', data: newLecture });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message || 'Failed to create guest lecture' });
  }
};

exports.update = async (req, res) => {
  try {
    const oldLecture = await GuestLecture.findById(req.params.id);
    if (!oldLecture) return res.status(404).json({ status: 'error', message: 'Not found' });

    const payload = { ...req.body, updatedBy: req.user._id };

    if (payload.startTime && payload.endTime && payload.startTime >= payload.endTime) {
      return res.status(400).json({ status: 'error', message: 'End time must be later than start time.' });
    }

    // Auto recalculate eligible students if scope changed
    const scopeChanged = 
      JSON.stringify(payload.targetBranches) !== JSON.stringify(oldLecture.targetBranches) ||
      JSON.stringify(payload.targetYear) !== JSON.stringify(oldLecture.targetYear) ||
      payload.targetSection !== oldLecture.targetSection?.toString() ||
      payload.targetSemester !== oldLecture.targetSemester;

    if (scopeChanged) {
        const query = {};
        if (payload.targetBranches && payload.targetBranches.length > 0) {
          query.branchId = { $in: payload.targetBranches };
        }
        if (payload.targetYear && payload.targetYear.length > 0) {
          const years = Array.isArray(payload.targetYear) ? payload.targetYear : [payload.targetYear];
          query.year = { $in: years.map(Number) };
        }
        if (payload.targetSection) query.sectionId = payload.targetSection;
        
        if (payload.targetSemester && payload.targetYear && payload.targetYear.length > 0) {
            const Semester = require('../../academic-master/models/Semester');
            const years = Array.isArray(payload.targetYear) ? payload.targetYear : [payload.targetYear];
            const semIds = [];
            for (const y of years) {
                const semesterCode = `${y}-${payload.targetSemester}`;
                const sems = await Semester.find({ semesterCode });
                sems.forEach(s => semIds.push(s._id));
            }
            if (semIds.length > 0) query.semesterId = { $in: semIds };
        }
        
        const targetStudents = await Student.find(query).select('_id');
        payload.eligibleStudentIds = targetStudents.map(s => s._id);
        
        if (!payload.eligibleStudentIds || payload.eligibleStudentIds.length === 0) {
          return res.status(400).json({ status: 'error', message: 'No target students found for the selected criteria.' });
        }
    }

    const updatedLecture = await GuestLecture.findByIdAndUpdate(req.params.id, payload, { new: true });
    
    const changed = 
      new Date(oldLecture.date).getTime() !== new Date(updatedLecture.date).getTime() ||
      oldLecture.startTime !== updatedLecture.startTime ||
      oldLecture.endTime !== updatedLecture.endTime ||
      oldLecture.venue !== updatedLecture.venue ||
      oldLecture.topic !== updatedLecture.topic ||
      oldLecture.status !== updatedLecture.status ||
      oldLecture.speakerName !== updatedLecture.speakerName ||
      scopeChanged;

    if (changed) {
      await sendGuestLectureNotifications(updatedLecture, true);
    }

    res.status(200).json({ status: 'success', data: updatedLecture });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to update guest lecture' });
  }
};

exports.delete = async (req, res) => {
  try {
    const deletedLecture = await GuestLecture.findByIdAndDelete(req.params.id);
    if (!deletedLecture) return res.status(404).json({ status: 'error', message: 'Not found' });
    
    // Cancellation notification
    if (deletedLecture.eligibleStudentIds && deletedLecture.eligibleStudentIds.length > 0) {
      const users = await User.find({ 'scopeRef.type': 'Student', 'scopeRef.refId': { $in: deletedLecture.eligibleStudentIds } });
      let subjectName = deletedLecture.customSubjectName || '';
      if (deletedLecture.subjectId) {
        const sub = await Subject.findById(deletedLecture.subjectId);
        if (sub) subjectName = sub.subjectName;
      }
      
      const notifications = users.map(u => ({
        recipientUserId: u._id,
        recipientRole: 'STUDENT',
        title: 'Guest Lecture Cancelled',
        message: `The ${subjectName} Guest Lecture scheduled for ${new Date(deletedLecture.date).toLocaleDateString()} has been cancelled.`,
        notificationType: 'GUEST_LECTURE',
        referenceType: 'GuestLecture',
        referenceId: deletedLecture._id
      }));
      
      if (deletedLecture.createdBy) {
        notifications.push({
          recipientUserId: deletedLecture.createdBy,
          recipientRole: 'COORDINATOR',
          title: 'Guest Lecture Cancelled',
          message: `The ${subjectName} Guest Lecture scheduled for ${new Date(deletedLecture.date).toLocaleDateString()} has been cancelled.`,
          notificationType: 'GUEST_LECTURE',
          referenceType: 'GuestLecture',
          referenceId: deletedLecture._id
        });
      }

      if (notifications.length > 0) {
        await notificationService.createBulkNotifications(notifications);
      }
    }
    
    res.status(200).json({ status: 'success', message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to delete guest lecture' });
  }
};
