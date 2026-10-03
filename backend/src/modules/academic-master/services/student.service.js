const Student = require('../models/Student');
const Campus = require('../models/Campus');
const Branch = require('../models/Branch');
const CampusBranchAvailability = require('../models/CampusBranchAvailability');
require('../models/Semester');
require('../models/Section');

class StudentService {
  static async validateCampusBranch(campusId, branchId) {
    const campus = await Campus.findById(campusId);
    if (!campus) throw new Error('Campus not found');
    
    const branch = await Branch.findById(branchId);
    if (!branch) throw new Error('Branch not found');

    const availability = await CampusBranchAvailability.findOne({
      campusId,
      branchId,
    });

    if (!availability || !availability.isAvailable) {
      throw new Error(`Branch ${branch.code} is not available at Campus ${campus.code}`);
    }
  }

  static async createStudent(data) {
    await this.validateCampusBranch(data.campusId, data.branchId);
    
    const student = new Student(data);
    return await student.save();
  }

  static async getStudents(filter = {}) {
    return await Student.find(filter).populate('campusId branchId semesterId sectionId');
  }

  static async getStudentById(id) {
    return await Student.findById(id).populate('campusId branchId semesterId sectionId');
  }

  static async updateStudent(id, data) {
    if (data.campusId || data.branchId) {
      const student = await Student.findById(id);
      if (!student) throw new Error('Student not found');
      
      const newCampusId = data.campusId || student.campusId;
      const newBranchId = data.branchId || student.branchId;
      
      await this.validateCampusBranch(newCampusId, newBranchId);
    }

    return await Student.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  static async deleteStudent(id) {
    return await Student.findByIdAndDelete(id);
  }
}

module.exports = StudentService;
