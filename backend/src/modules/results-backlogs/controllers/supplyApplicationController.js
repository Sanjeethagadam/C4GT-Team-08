const SupplyApplication = require("../models/SupplyApplication");

const getSupplyApplications = async (req, res) => {
    try {
        const applications = await SupplyApplication.find()
            .populate("studentId")
            .populate("backlogId");

        res.status(200).json({
            success: true,
            data: applications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch supply applications",
            error: error.message
        });
    }
};

const createSupplyApplication = async (req, res) => {
    try {
        const application = await SupplyApplication.create(req.body);

        res.status(201).json({
            success: true,
            data: application
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to create supply application",
            error: error.message
        });
    }
};

module.exports = {
    getSupplyApplications,
    createSupplyApplication
};