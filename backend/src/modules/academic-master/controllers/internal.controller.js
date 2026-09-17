const Student = require("../models/Student");

const getInternalStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        res.status(200).json({
            rollNo: student.rollNo,
            name: student.name,
            campusId: student.campusId,
            branchId: student.branchId,
            year: student.year,
            semesterId: student.semesterId,
            sectionId: student.sectionId
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getInternalStudentById
};
