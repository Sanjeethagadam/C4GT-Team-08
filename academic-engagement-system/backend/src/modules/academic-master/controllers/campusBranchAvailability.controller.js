const availabilityService = require("../services/campusBranchAvailability.service");

const createAvailability = async (req, res) => {
    try {
        const availability =
            await availabilityService.createAvailability(req.body);

        res.status(201).json({
            success: true,
            data: availability
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
            errors: []
        });
    }
};

const getAllAvailability = async (req, res) => {
    try {
        const availability =
            await availabilityService.getAllAvailability();

        res.json({
            success: true,
            data: availability
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            errors: []
        });
    }
};

const getAvailabilityById = async (req, res) => {
    try {
        const availability =
            await availabilityService.getAvailabilityById(req.params.id);

        if (!availability) {
            return res.status(404).json({
                success: false,
                message: "Availability record not found",
                errors: []
            });
        }

        res.json({
            success: true,
            data: availability
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
            errors: []
        });
    }
};

const updateAvailability = async (req, res) => {
    try {
        const availability =
            await availabilityService.updateAvailability(
                req.params.id,
                req.body
            );

        if (!availability) {
            return res.status(404).json({
                success: false,
                message: "Availability record not found",
                errors: []
            });
        }

        res.json({
            success: true,
            data: availability
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
            errors: []
        });
    }
};

const deleteAvailability = async (req, res) => {
    try {
        const availability =
            await availabilityService.deleteAvailability(req.params.id);

        if (!availability) {
            return res.status(404).json({
                success: false,
                message: "Availability record not found",
                errors: []
            });
        }

        res.json({
            success: true,
            data: availability
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
    createAvailability,
    getAllAvailability,
    getAvailabilityById,
    updateAvailability,
    deleteAvailability
};