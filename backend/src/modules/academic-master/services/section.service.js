const Section = require('../models/Section');
const Branch = require('../models/Branch');

class SectionService {
  static async createSection(data) {
    const branch = await Branch.findById(data.branchId);
    if (!branch) throw new Error('Branch not found');

    const section = new Section(data);
    return await section.save();
  }

  static async getSections() {
    return await Section.find().populate('branchId');
  }

  static async updateSection(id, data) {
    if (data.branchId) {
      const branch = await Branch.findById(data.branchId);
      if (!branch) throw new Error('Branch not found');
    }
    return await Section.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  static async deleteSection(id) {
    return await Section.findByIdAndDelete(id);
  }
}

module.exports = SectionService;
