const Marks = require('../models/Marks');
const Examination = require('../models/Examination');
const Subject = require('../../academic-master/models/Subject');
const Student = require('../../academic-master/models/Student');
const SubjectBranchMapping = require('../../academic-master/models/SubjectBranchMapping');
const CtpoAssignment = require('../models/CtpoAssignment');

exports.enterMarks = async (req, res) => {
  // Legacy entry endpoint preserved if needed
  try {
    const { studentId, examinationId, subjectId, marksObtained, maxMarks, status } = req.body;

    if (!studentId || !examinationId || !subjectId || !maxMarks || !status) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    if (marksObtained > maxMarks) {
      return res.status(400).json({ success: false, message: 'Marks obtained cannot exceed max marks' });
    }

    const student = await Student.findById(studentId).populate('branchId');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const exam = await Examination.findById(examinationId);
    if (!exam) return res.status(404).json({ success: false, message: 'Examination not found' });

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });

    const sbm = await SubjectBranchMapping.findOne({
      subjectId,
      branchId: student.branchId._id,
      semesterId: exam.semesterId
    });
    if (!sbm) {
      return res.status(400).json({ success: false, message: 'Subject does not belong to student academic context for this semester' });
    }

    const existingMarks = await Marks.findOne({ studentId, examinationId, subjectId });
    if (existingMarks) {
      return res.status(400).json({ success: false, message: 'Marks already entered for this subject and exam' });
    }

    const marksEntry = await Marks.create({
      studentId, examinationId, subjectId, marksObtained, maxMarks, status
    });

    res.status(201).json({ success: true, data: marksEntry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStudentMarks = async (req, res) => {
  try {
    const { id } = req.params; 

    let student;
    if (id === 'me') {
      student = await Student.findOne({ _id: req.user.scopeRef?.refId });
      if (!student && req.user.role === 'STUDENT') {
         // Fallback if scopeRef isn't properly populated
         const user = await require('../../academic-master/models/User').findById(req.user.id || req.user._id);
         student = await Student.findById(user.scopeRef.refId);
      }
    } else {
      student = await Student.findById(id);
      if (!student) {
         student = await Student.findOne({ htno: id });
      }
    }

    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    // Validate access (Student can only see their own marks)
    if (req.user.role === 'STUDENT') {
        const refId = req.user.scopeRef?.refId || (await require('../../academic-master/models/User').findById(req.user.id || req.user._id)).scopeRef.refId;
        if (refId.toString() !== student._id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only view your own marks' });
        }
    }

    const marks = await Marks.find({ studentId: student._id })
      .populate('examinationId')
      .populate('subjectId');

    res.status(200).json({ success: true, data: marks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInternalMarks = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        status: 'NOT_DEFINED',
        reason: 'PENDING_AUTHORITATIVE_RULE',
        message: 'The official R23 internal-mark aggregation formula is not yet confirmed. Awaiting specifications to implement best-of-two, average, or other weighted rule.'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// NEW Phase 4B: Bulk Entry and Fetch Dataset

exports.getAssignedDataset = async (req, res) => {
  try {
    const { assignmentId, examinationId } = req.query;
    if (!assignmentId || !examinationId) {
      return res.status(400).json({ success: false, message: 'assignmentId and examinationId required' });
    }

    const assignment = await CtpoAssignment.findById(assignmentId)
      .populate('campusId', 'name')
      .populate('branchId', 'name')
      .populate('academicYearId', 'yearString academicYear')
      .populate('semesterId', 'semesterName semesterCode')
      .populate('sectionId', 'sectionName');
      
    if (!assignment || assignment.status !== 'ACTIVE') {
      return res.status(404).json({ success: false, message: 'Active assignment not found' });
    }

    // Role check
    if (req.user.role === 'CTPO' && assignment.ctpoUserId.toString() !== (req.user.id || req.user._id)) {
      return res.status(403).json({ success: false, message: 'You do not own this assignment' });
    }

    const students = await Student.find({ sectionId: assignment.sectionId });
    const studentIds = students.map(s => s._id);

    const sbms = await SubjectBranchMapping.find({
      branchId: assignment.branchId,
      semesterId: assignment.semesterId
    }).populate('subjectId');

    const subjects = sbms.map(sbm => sbm.subjectId).filter(Boolean);

    const marks = await Marks.find({
      studentId: { $in: studentIds },
      examinationId
    });

    const exam = await Examination.findById(examinationId);

    res.status(200).json({ success: true, data: { students, marks, subjects, assignment, exam } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.bulkEnterMarks = async (req, res) => {
  try {
    const { assignmentId, examinationId, subjectId, marksData, isSubmit } = req.body;
    // marksData: [{ studentId, marksObtained, maxMarks, status }]

    if (!assignmentId || !examinationId || !subjectId || !marksData || !Array.isArray(marksData)) {
      return res.status(400).json({ success: false, message: 'Invalid payload' });
    }

    const assignment = await CtpoAssignment.findById(assignmentId);
    if (!assignment || assignment.status !== 'ACTIVE') {
      return res.status(400).json({ success: false, message: 'Active assignment not found' });
    }

    if (req.user.role === 'CTPO' && assignment.ctpoUserId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You do not own this assignment' });
    }

    const exam = await Examination.findById(examinationId);
    if (!exam) return res.status(404).json({ success: false, message: 'Examination not found' });
    if (exam.examType === 'SEMESTER') {
      return res.status(403).json({ success: false, message: 'Manual entry for SEMESTER exams is not allowed via this workflow.' });
    }

    if (exam.semesterId.toString() !== assignment.semesterId.toString()) {
       return res.status(400).json({ success: false, message: 'Examination semester does not match assignment semester' });
    }

    const bulkOps = [];
    for (const m of marksData) {
      if (m.marksObtained > m.maxMarks) {
        return res.status(400).json({ success: false, message: 'marksObtained cannot exceed maxMarks' });
      }

      // Verify student belongs to section
      const student = await Student.findById(m.studentId);
      if (!student) return res.status(400).json({ success: false, message: `Student ${m.studentId} not found` });
      
      if (!student.sectionId || student.sectionId.toString() !== assignment.sectionId.toString()) {
         return res.status(400).json({ success: false, message: `Student ${student.name} does not belong to the assigned section` });
      }

      const updatePayload = {
        marksObtained: m.marksObtained,
        maxMarks: m.maxMarks,
        status: m.status,
        draft: !isSubmit,
        lastModifiedBy: req.user.id
      };

      if (isSubmit) {
        updatePayload.submittedAt = new Date();
      }

      bulkOps.push({
        updateOne: {
          filter: {
            studentId: m.studentId,
            examinationId,
            subjectId
          },
          update: { $set: updatePayload },
          upsert: true
        }
      });
    }

    if (bulkOps.length > 0) {
      await Marks.bulkWrite(bulkOps);
    }

    res.status(200).json({ success: true, message: `Successfully ${isSubmit ? 'submitted' : 'saved draft'} for ${bulkOps.length} marks` });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
