const Branch = require('../models/Branch');

class BranchService {
  static async createBranch(data) {
    const branch = new Branch(data);
    return await branch.save();
  }

  static async getBranches() {
    return await Branch.find();
  }

  static async updateBranch(id, data) {
    return await Branch.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  static async deleteBranch(id) {
    return await Branch.findByIdAndDelete(id);
  }
}

module.exports = BranchService;
