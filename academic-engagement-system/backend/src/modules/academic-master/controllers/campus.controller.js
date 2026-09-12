const campusService = require("../services/campus.service");

const createCampus = async (req, res) => {
    try {
        const campus = await campusService.createCampus(req.body);

        res.status(201).json({
            success: true,
            data: campus
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
            errors: []
        });
    }
};

const getAllCampuses = async (req, res) => {
    try {
        const campuses = await campusService.getAllCampuses();

        res.json({
            success: true,
            data: campuses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            errors: []
        });
    }
};

const getCampusById = async (req, res) => {
    try {
        const campus = await campusService.getCampusById(req.params.id);

        if (!campus) {
            return res.status(404).json({
                success: false,
                message: "Campus not found",
                errors: []
            });
        }

        res.json({
            success: true,
            data: campus
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
            errors: []
        });
    }
};

const updateCampus = async (req, res) => {
    try {
        const campus = await campusService.updateCampus(
            req.params.id,
            req.body
        );

        if (!campus) {
            return res.status(404).json({
                success: false,
                message: "Campus not found",
                errors: []
            });
        }

        res.json({
            success: true,
            data: campus
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
            errors: []
        });
    }
};

const deleteCampus = async (req, res) => {
    try {
        const campus = await campusService.deleteCampus(req.params.id);

        if (!campus) {
            return res.status(404).json({
                success: false,
                message: "Campus not found",
                errors: []
            });
        }

        res.json({
            success: true,
            data: campus
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
    createCampus,
    getAllCampuses,
    getCampusById,
    updateCampus,
    deleteCampus
};