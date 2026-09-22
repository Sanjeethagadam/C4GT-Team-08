const Semester = require('../models/Semester');
const AcademicYear = require('../models/AcademicYear');

class SemesterService {
  static async createSemester(data) {
    const ay = await AcademicYear.findById(data.academicYearId);
    if (!ay) throw new Error('Academic year not found');

    const semester = new Semester(data);
    return await semester.save();
  }

  static async getSemesters() {
    return await Semester.find().populate('academicYearId');
  }

  static async updateSemester(id, data) {
    if (data.academicYearId) {
      const ay = await AcademicYear.findById(data.academicYearId);
      if (!ay) throw new Error('Academic year not found');
    }
    return await Semester.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }
}

module.exports = SemesterService;
