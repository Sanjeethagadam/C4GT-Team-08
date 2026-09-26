const AcademicYear = require('../models/AcademicYear');

class AcademicYearService {
  static async createAcademicYear(data) {
    const year = new AcademicYear(data);
    return await year.save();
  }

  static async getAcademicYears() {
    return await AcademicYear.find().sort({ startDate: -1 });
  }

  static async updateAcademicYear(id, data) {
    return await AcademicYear.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  static async deleteAcademicYear(id) {
    const Semester = require('../models/Semester');
    const CtpoAssignment = require('../../examination/models/CtpoAssignment');

    const semesterCount = await Semester.countDocuments({ academicYearId: id });
    const ctpoCount = await CtpoAssignment.countDocuments({ academicYearId: id });

    if (semesterCount > 0 || ctpoCount > 0) {
      const error = new Error('Academic year cannot be removed because it is referenced by existing semesters or CTPO assignments.');
      error.code = 'ACADEMIC_YEAR_IN_USE';
      throw error;
    }

    return await AcademicYear.findByIdAndDelete(id);
  }
}

module.exports = AcademicYearService;
