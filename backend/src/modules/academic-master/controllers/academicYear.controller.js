const academicYearService = require("../services/academicYear.service");

const createAcademicYear = async (req, res) => {
    try {
        const academicYear =
            await academicYearService.createAcademicYear(req.body);

        res.status(201).json({
            success: true,
            data: academicYear
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
            errors: []
        });
    }
};

const getAllAcademicYears = async (req, res) => {
    try {
        const academicYears =
            await academicYearService.getAllAcademicYears();

        res.json({
            success: true,
            data: academicYears
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            errors: []
        });
    }
};

const getAcademicYearById = async (req, res) => {
    try {
        const academicYear =
            await academicYearService.getAcademicYearById(req.params.id);

        if (!academicYear) {
            return res.status(404).json({
                success: false,
                message: "Academic year not found",
                errors: []
            });
        }

        res.json({
            success: true,
            data: academicYear
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
            errors: []
        });
    }
};

const updateAcademicYear = async (req, res) => {
    try {
        const academicYear =
            await academicYearService.updateAcademicYear(
                req.params.id,
                req.body
            );

        if (!academicYear) {
            return res.status(404).json({
                success: false,
                message: "Academic year not found",
                errors: []
            });
        }

        res.json({
            success: true,
            data: academicYear
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
            errors: []
        });
    }
};

const deleteAcademicYear = async (req, res) => {
    try {
        const academicYear =
            await academicYearService.deleteAcademicYear(req.params.id);

        if (!academicYear) {
            return res.status(404).json({
                success: false,
                message: "Academic year not found",
                errors: []
            });
        }

        res.json({
            success: true,
            data: academicYear
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
    createAcademicYear,
    getAllAcademicYears,
    getAcademicYearById,
    updateAcademicYear,
    deleteAcademicYear
};