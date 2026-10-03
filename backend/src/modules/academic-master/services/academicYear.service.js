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
}

module.exports = AcademicYearService;
