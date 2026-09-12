const semesterService = require("../services/semester.service");

const createSemester = async (req, res) => {
    try {
        const semester = await semesterService.createSemester(req.body);

        res.status(201).json({
            success: true,
            data: semester
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
            errors: []
        });
    }
};

const getAllSemesters = async (req, res) => {
    try {
        const semesters = await semesterService.getAllSemesters();

        res.json({
            success: true,
            data: semesters
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            errors: []
        });
    }
};

const getSemesterById = async (req, res) => {
    try {
        const semester = await semesterService.getSemesterById(
            req.params.id
        );

        if (!semester) {
            return res.status(404).json({
                success: false,
                message: "Semester not found",
                errors: []
            });
        }

        res.json({
            success: true,
            data: semester
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
            errors: []
        });
    }
};

const updateSemester = async (req, res) => {
    try {
        const semester = await semesterService.updateSemester(
            req.params.id,
            req.body
        );

        if (!semester) {
            return res.status(404).json({
                success: false,
                message: "Semester not found",
                errors: []
            });
        }

        res.json({
            success: true,
            data: semester
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
            errors: []
        });
    }
};

const deleteSemester = async (req, res) => {
    try {
        const semester = await semesterService.deleteSemester(
            req.params.id
        );

        if (!semester) {
            return res.status(404).json({
                success: false,
                message: "Semester not found",
                errors: []
            });
        }

        res.json({
            success: true,
            data: semester
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
            errors: []
        });
    }
};

module.exports = {
    createSemester,
    getAllSemesters,
    getSemesterById,
    updateSemester,
    deleteSemester
};