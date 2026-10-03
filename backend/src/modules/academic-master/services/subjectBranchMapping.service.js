const SubjectBranchMapping = require('../models/SubjectBranchMapping');
const Subject = require('../models/Subject');
const Branch = require('../models/Branch');
const Semester = require('../models/Semester');

class SubjectBranchMappingService {
  static async createMapping(data) {
    const subject = await Subject.findById(data.subjectId);
    if (!subject) throw new Error('Subject not found');

    const branch = await Branch.findById(data.branchId);
    if (!branch) throw new Error('Branch not found');

    const semester = await Semester.findById(data.semesterId);
    if (!semester) throw new Error('Semester not found');

    if (subject.semesterId.toString() !== data.semesterId.toString()) {
      throw new Error("Subject's semester does not match the provided semesterId");
    }

    const mapping = new SubjectBranchMapping(data);
    return await mapping.save();
  }

  static async getMappings() {
    return await SubjectBranchMapping.find().populate('subjectId branchId semesterId');
  }

  static async updateMapping(id, data) {
    // Cross-validation
    const mapping = await SubjectBranchMapping.findById(id);
    if (!mapping) throw new Error('Mapping not found');

    const sId = data.subjectId || mapping.subjectId;
    const bId = data.branchId || mapping.branchId;
    const semId = data.semesterId || mapping.semesterId;

    if (data.subjectId) {
      const subject = await Subject.findById(data.subjectId);
      if (!subject) throw new Error('Subject not found');
      if (subject.semesterId.toString() !== semId.toString()) {
        throw new Error("Subject's semester does not match the mapping semesterId");
      }
    }
    if (data.branchId) {
      const branch = await Branch.findById(data.branchId);
      if (!branch) throw new Error('Branch not found');
    }
    if (data.semesterId) {
      const semester = await Semester.findById(data.semesterId);
      if (!semester) throw new Error('Semester not found');
      
      const subjectToCheck = await Subject.findById(sId);
      if (subjectToCheck.semesterId.toString() !== semId.toString()) {
        throw new Error("Subject's semester does not match the new semesterId");
      }
    }

    return await SubjectBranchMapping.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  static async deleteMapping(id) {
    return await SubjectBranchMapping.findByIdAndDelete(id);
  }
}

module.exports = SubjectBranchMappingService;
