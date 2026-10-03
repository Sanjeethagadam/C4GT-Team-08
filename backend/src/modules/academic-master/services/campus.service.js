const Campus = require('../models/Campus');

class CampusService {
  static async createCampus(data) {
    const campus = new Campus(data);
    return await campus.save();
  }

  static async getCampuses() {
    return await Campus.find();
  }

  static async getCampusById(id) {
    return await Campus.findById(id);
  }

  static async updateCampus(id, data) {
    return await Campus.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  static async deleteCampus(id) {
    const Student = require('../models/Student');
    const CampusBranchAvailability = require('../models/CampusBranchAvailability');
    const CtpoAssignment = require('../../examination/models/CtpoAssignment');

    const [students, branchMappings, ctpoAssignments] = await Promise.all([
      Student.countDocuments({ campusId: id }),
      CampusBranchAvailability.countDocuments({ campusId: id }),
      CtpoAssignment.countDocuments({ campusId: id })
    ]);

    const totalRefs = students + branchMappings + ctpoAssignments;

    if (totalRefs > 0) {
      // Soft delete
      return await Campus.findByIdAndUpdate(id, { status: 'INACTIVE' }, { new: true });
    } else {
      // Hard delete
      return await Campus.findByIdAndDelete(id);
    }
  }
}

module.exports = CampusService;
