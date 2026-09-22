const Examination = require('../models/Examination');
const AcademicYear = require('../../academic-master/models/AcademicYear');
const Semester = require('../../academic-master/models/Semester');

exports.createExamination = async (req, res) => {
  try {
    const { examType, academicYearId, semesterId } = req.body;

    if (!examType || !academicYearId || !semesterId) {
      return res.status(400).json({ success: false, message: 'examType, academicYearId, and semesterId are required' });
    }

    if (!['MID1', 'MID2', 'SEMESTER'].includes(examType)) {
      return res.status(400).json({ success: false, message: 'Invalid examType' });
    }

    const academicYear = await AcademicYear.findById(academicYearId);
    if (!academicYear) {
      return res.status(404).json({ success: false, message: 'Academic Year not found' });
    }

    const semester = await Semester.findById(semesterId);
    if (!semester) {
      return res.status(404).json({ success: false, message: 'Semester not found' });
    }

    const existingExam = await Examination.findOne({ examType, academicYearId, semesterId });
    if (existingExam) {
      return res.status(400).json({ success: false, message: 'Examination already exists' });
    }

    const examination = await Examination.create({ examType, academicYearId, semesterId, status: 'SCHEDULED' });

    res.status(201).json({ success: true, data: examination });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.listExaminations = async (req, res) => {
  try {
    const filter = {};
    if (req.query.academicYearId) filter.academicYearId = req.query.academicYearId;
    if (req.query.semesterId) filter.semesterId = req.query.semesterId;
    if (req.query.examType) filter.examType = req.query.examType;

    const examinations = await Examination.find(filter)
      .populate('academicYearId', 'yearString')
      .populate('semesterId', 'semesterCode semesterName');

    res.status(200).json({ success: true, data: examinations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
