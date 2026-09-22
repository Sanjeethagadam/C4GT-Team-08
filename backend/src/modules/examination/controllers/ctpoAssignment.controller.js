const CtpoAssignment = require('../models/CtpoAssignment');

exports.createAssignment = async (req, res) => {
  try {
    const {
      ctpoUserId, campusId, branchId, academicYearId, semesterId, sectionId, studentCategory
    } = req.body;

    // Check for existing ACTIVE assignment
    const existing = await CtpoAssignment.findOne({
      campusId, branchId, academicYearId, semesterId, sectionId, studentCategory, status: 'ACTIVE'
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An ACTIVE CTPO assignment already exists for this exact scope. Please use the reassign endpoint to explicitly deactivate the old assignment.'
      });
    }

    const assignment = await CtpoAssignment.create({
      ctpoUserId, campusId, branchId, academicYearId, semesterId, sectionId, studentCategory,
      status: 'ACTIVE',
      assignedBy: req.user.id
    });

    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAssignments = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'CTPO') {
      filter.ctpoUserId = req.user.id;
      filter.status = 'ACTIVE';
    }

    const assignments = await CtpoAssignment.find(filter)
      .populate('ctpoUserId', 'name username')
      .populate('campusId', 'name')
      .populate('branchId', 'name')
      .populate('academicYearId', 'yearString')
      .populate('semesterId', 'semesterName')
      .populate('sectionId', 'name');

    res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.reassignAssignment = async (req, res) => {
  try {
    const { oldAssignmentId, newCtpoUserId } = req.body;

    const oldAssignment = await CtpoAssignment.findById(oldAssignmentId);
    if (!oldAssignment) {
      return res.status(404).json({ success: false, message: 'Old assignment not found' });
    }

    if (oldAssignment.status !== 'ACTIVE') {
      return res.status(400).json({ success: false, message: 'Old assignment is not active' });
    }

    // Deactivate old
    oldAssignment.status = 'INACTIVE';
    await oldAssignment.save();

    // Create new
    const newAssignment = await CtpoAssignment.create({
      ctpoUserId: newCtpoUserId,
      campusId: oldAssignment.campusId,
      branchId: oldAssignment.branchId,
      academicYearId: oldAssignment.academicYearId,
      semesterId: oldAssignment.semesterId,
      sectionId: oldAssignment.sectionId,
      studentCategory: oldAssignment.studentCategory,
      status: 'ACTIVE',
      assignedBy: req.user.id
    });

    res.status(200).json({ success: true, data: newAssignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
