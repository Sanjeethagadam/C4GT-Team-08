const CampusBranchAvailability = require('../models/CampusBranchAvailability');
const Campus = require('../models/Campus');
const Branch = require('../models/Branch');

class CampusBranchAvailabilityService {
  static async createAvailability(data) {
    const campus = await Campus.findById(data.campusId);
    if (!campus) throw new Error('Campus not found');
    const branch = await Branch.findById(data.branchId);
    if (!branch) throw new Error('Branch not found');

    const availability = new CampusBranchAvailability(data);
    return await availability.save();
  }

  static async getAvailabilities() {
    return await CampusBranchAvailability.find().populate('campusId branchId');
  }

  static async updateAvailability(id, data) {
    if (data.campusId || data.branchId) {
      if (data.campusId) {
        const campus = await Campus.findById(data.campusId);
        if (!campus) throw new Error('Campus not found');
      }
      if (data.branchId) {
        const branch = await Branch.findById(data.branchId);
        if (!branch) throw new Error('Branch not found');
      }
    }
    return await CampusBranchAvailability.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate('campusId branchId');
  }
}

module.exports = CampusBranchAvailabilityService;
