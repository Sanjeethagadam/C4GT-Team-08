const studentService = require("../services/student.service");

const createStudent = async (req, res) => {
    try {
        const student = await studentService.createStudent(req.body, req.user);

        res.status(201).json({
            success: true,
            data: student
        });
    } catch (error) {
        const statusCode = error.message.includes("Forbidden") ? 403 : 400;
        res.status(statusCode).json({
            success: false,
            message: error.message,
            errors: error.errors || null
        });
    }
};

const createStudents = async (req, res) => {
    try {
        const students = await studentService.createStudents(req.body, req.user);

        res.status(201).json({
            success: true,
            data: students
        });
    } catch (error) {
        const statusCode = error.message.includes("Forbidden") ? 403 : 400;
        res.status(statusCode).json({
            success: false,
            message: error.message,
            errors: error.errors || null
        });
    }
};

const getAllStudents = async (req, res) => {
    try {
        const filter = req.scopeFilter || {};
        const students = await studentService.getAllStudents(filter);

        res.status(200).json({
            success: true,
            data: students
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getStudentById = async (req, res) => {
    try {
        const student = await studentService.getStudentById(req.params.id, req.user);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        res.status(200).json({
            success: true,
            data: student
        });
    } catch (error) {
        const statusCode = error.message.includes("Forbidden") ? 403 : 400;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

const updateStudent = async (req, res) => {
    try {
        const student = await studentService.updateStudent(
            req.params.id,
            req.body,
            req.user
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        res.status(200).json({
            success: true,
            data: student
        });
    } catch (error) {
        const statusCode = error.message.includes("Forbidden") ? 403 : 400;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

const deleteStudent = async (req, res) => {
    try {
        const student = await studentService.deleteStudent(req.params.id, req.user);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        res.status(200).json({
            success: true,
            data: student
        });
    } catch (error) {
        const statusCode = error.message.includes("Forbidden") ? 403 : 400;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createStudent,
    createStudents,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent
};