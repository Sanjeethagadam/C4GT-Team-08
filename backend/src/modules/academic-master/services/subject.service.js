const Subject = require('../models/Subject');
const Semester = require('../models/Semester');

class SubjectService {
  static async createSubject(data) {
    const semester = await Semester.findById(data.semesterId);
    if (!semester) throw new Error('Semester not found');

    const subject = new Subject(data);
    return await subject.save();
  }

  static async getSubjects() {
    return await Subject.find().populate('semesterId');
  }

  static async updateSubject(id, data) {
    if (data.semesterId) {
      const semester = await Semester.findById(data.semesterId);
      if (!semester) throw new Error('Semester not found');
    }
    return await Subject.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  static async deleteSubject(id) {
    return await Subject.findByIdAndDelete(id);
  }
}

module.exports = SubjectService;
