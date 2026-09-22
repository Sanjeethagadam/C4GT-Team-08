const Timetable = require('../models/Timetable');
const Examination = require('../models/Examination');
const Subject = require('../../academic-master/models/Subject');
const Branch = require('../../academic-master/models/Branch');

exports.createOrUpdateTimetable = async (req, res) => {
  try {
    const { examinationId, subjectId, branchId, examDate, startTime, endTime } = req.body;

    if (!examinationId || !subjectId || !branchId || !examDate || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const exam = await Examination.findById(examinationId);
    if (!exam) return res.status(404).json({ success: false, message: 'Examination not found' });

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });

    const branch = await Branch.findById(branchId);
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' });

    const timetable = await Timetable.findOneAndUpdate(
      { examinationId, subjectId, branchId },
      { examDate, startTime, endTime },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: timetable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
