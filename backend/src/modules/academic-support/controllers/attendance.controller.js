const AttendanceSession = require('../models/AttendanceSession');
const AttendanceRecord = require('../models/AttendanceRecord');
const Student = require('../../academic-master/models/Student');
const RemedialClass = require('../models/RemedialClass');
const GuestLecture = require('../models/GuestLecture');
const Subject = require('../../academic-master/models/Subject');
const Branch = require('../../academic-master/models/Branch');

exports.getAttendanceSession = async (req, res) => {
  try {
    const { referenceId } = req.params;
    
    let event = await RemedialClass.findById(referenceId).populate({
      path: 'eligibleStudentIds',
      populate: { path: 'branchId', select: 'code name' }
    }).populate('subjectId', 'subjectName');
    let type = 'RemedialClass';

    if (!event) {
      event = await GuestLecture.findById(referenceId).populate({
        path: 'eligibleStudentIds',
        populate: { path: 'branchId', select: 'code name' }
      }).populate('subjectId', 'subjectName');
      type = 'GuestLecture';
    }

    if (!event) return res.status(404).json({ status: 'error', message: 'Event not found' });

    let session = await AttendanceSession.findOne({ referenceId });
    let existingRecords = [];
    if (session) {
      existingRecords = await AttendanceRecord.find({ attendanceSessionId: session._id })
        .populate({ path: 'studentId', populate: { path: 'branchId', select: 'code name' } });
    }

    // Map existing records for quick lookup
    const existingMap = new Map();
    existingRecords.forEach(r => {
      existingMap.set(r.studentId._id.toString(), r);
    });

    // Reconcile with latest eligibleStudentIds
    const records = event.eligibleStudentIds.map(student => {
      const existing = existingMap.get(student._id.toString());
      if (existing) {
        return existing;
      }
      return {
        studentId: student,
        present: false
      };
    });

    let subjectName = '-';
    if (type === 'RemedialClass') {
      subjectName = event.subjectId?.subjectName || event.customSubjectName || '-';
    } else {
      subjectName = event.subjectId?.subjectName || event.customSubjectName || '-';
    }

    // Build the enriched session object
    const sessionObj = {
      referenceId: event._id,
      referenceType: type,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      venue: event.venue,
      topic: event.topic || '-',
      subjectName: subjectName,
      facultyName: event.facultyName || event.speakerName || '-',
      organization: event.organization || '-',
      designation: event.designation || '-',
      targetStudentCount: event.eligibleStudentIds.length,
      attendanceSubmitted: session ? session.attendanceSubmitted : false
    };

    res.status(200).json({ status: 'success', data: { session: sessionObj, records } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.submitAttendance = async (req, res) => {
  try {
    const { referenceId } = req.params;
    const { referenceType, records } = req.body;

    let event;
    if (referenceType === 'RemedialClass') {
      event = await RemedialClass.findById(referenceId);
    } else {
      event = await GuestLecture.findById(referenceId);
    }

    if (!event) return res.status(404).json({ status: 'error', message: 'Event not found' });

    let session = await AttendanceSession.findOne({ referenceId });
    if (!session) {
      session = new AttendanceSession({
        referenceId,
        referenceType,
        createdBy: req.user.id || req.user._id,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        venue: event.venue,
        targetStudentCount: event.eligibleStudentIds.length,
        attendanceSubmitted: true,
        submittedAt: new Date()
      });
      await session.save();
    } else {
      session.attendanceSubmitted = true;
      session.submittedAt = new Date();
      await session.save();
    }

    // Update or insert records
    const bulkOps = records.map(record => ({
      updateOne: {
        filter: { attendanceSessionId: session._id, studentId: record.studentId },
        update: { $set: { present: record.present, recordedBy: req.user.id || req.user._id } },
        upsert: true
      }
    }));

    if (bulkOps.length > 0) {
      await AttendanceRecord.bulkWrite(bulkOps);
    }

    res.status(200).json({ status: 'success', message: 'Attendance submitted successfully' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.getStudentHistory = async (req, res) => {
  try {
    let { studentId } = req.params;
    
    // ENFORCE STUDENT OWNERSHIP
    if (req.user.role === 'STUDENT') {
      const tokenStudentId = req.user.scopeRef?.refId;
      if (!tokenStudentId) {
        return res.status(403).json({ status: 'error', message: 'Student ID not found in token' });
      }
      studentId = tokenStudentId.toString(); // Override parameter with authenticated ID
    }

    const records = await AttendanceRecord.find({ studentId })
      .populate({
        path: 'attendanceSessionId',
        select: 'referenceType date startTime endTime venue referenceId'
      })
      .lean();

    if (!records || records.length === 0) {
      return res.status(200).json({ status: 'success', data: [] });
    }

    const remedialIds = [];
    const guestIds = [];

    records.forEach(r => {
      const session = r.attendanceSessionId;
      if (session && session.referenceType === 'RemedialClass') remedialIds.push(session.referenceId);
      if (session && session.referenceType === 'GuestLecture') guestIds.push(session.referenceId);
    });

    const remedials = await RemedialClass.find({ _id: { $in: remedialIds } }).populate('subjectId', 'subjectName').lean();
    const guests = await GuestLecture.find({ _id: { $in: guestIds } }).populate('subjectId', 'subjectName').lean();

    const data = records.map(record => {
      const session = record.attendanceSessionId;
      if (!session) return null;
      let topic = '';
      let subject = '';

      if (session.referenceType === 'RemedialClass') {
        const remedial = remedials.find(r => r._id.toString() === session.referenceId.toString());
        if (remedial) {
          topic = remedial.topic;
          subject = remedial.subjectId?.subjectName || '-';
        }
      } else if (session.referenceType === 'GuestLecture') {
        const guest = guests.find(g => g._id.toString() === session.referenceId.toString());
        if (guest) {
          topic = guest.topic;
          subject = guest.subjectId?.subjectName || guest.customSubjectName || '-';
        }
      }

      return {
        _id: record._id,
        present: record.present,
        type: session.referenceType,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        venue: session.venue,
        topic,
        subject
      };
    }).filter(Boolean);

    res.status(200).json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.getAllProgress = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const pipeline = [
      {
        $group: {
          _id: "$studentId",
          totalSessions: { $sum: 1 },
          present: { $sum: { $cond: ["$present", 1, 0] } },
          absent: { $sum: { $cond: ["$present", 0, 1] } }
        }
      },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "_id",
          as: "student"
        }
      },
      { $unwind: "$student" },
      {
        $lookup: {
          from: "branches",
          localField: "student.branchId",
          foreignField: "_id",
          as: "student.branchId"
        }
      },
      {
        $unwind: { path: "$student.branchId", preserveNullAndEmptyArrays: true }
      }
    ];

    const matchStage = {};
    if (req.query.search) {
      matchStage["$or"] = [
        { "student.name": { $regex: req.query.search, $options: 'i' } },
        { "student.rollNo": { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.year) {
      matchStage["student.year"] = parseInt(req.query.year);
    }
    if (req.query.branch) {
      matchStage["student.branchId.code"] = { $regex: new RegExp(`^${req.query.branch}$`, 'i') };
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await AttendanceRecord.aggregate(countPipeline);
    const totalRecords = countResult.length > 0 ? countResult[0].total : 0;
    const totalPages = Math.ceil(totalRecords / limit) || 1;

    pipeline.push({ $sort: { "student.rollNo": 1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const results = await AttendanceRecord.aggregate(pipeline);

    const formattedResults = results.map(r => ({
      student: r.student,
      totalSessions: r.totalSessions,
      present: r.present,
      absent: r.absent,
      attendancePercentage: r.totalSessions > 0 ? Math.round((r.present / r.totalSessions) * 100) : 0
    }));

    res.status(200).json({ 
      status: 'success', 
      data: formattedResults,
      pagination: {
        page,
        limit,
        total: totalRecords,
        totalPages
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
