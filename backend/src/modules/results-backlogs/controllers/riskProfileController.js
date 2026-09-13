const RiskProfile = require("../models/RiskProfile");
const { calculateStudentRisk } = require("../services/riskService");


// Get all risk profiles
const getRiskProfiles = async (req, res) => {
    try {
        const riskProfiles = await RiskProfile.find()
            .populate("studentId");

        res.status(200).json({
            success: true,
            data: riskProfiles
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch risk profiles",
            error: error.message
        });
    }
};


// Calculate risk for one student
const calculateRisk = async (req, res) => {
    try {
        const { studentId } = req.params;

        const riskProfile = await calculateStudentRisk(studentId);

        res.status(200).json({
            success: true,
            message: "Risk calculated successfully",
            data: riskProfile
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to calculate risk",
            error: error.message
        });
    }
};


module.exports = {
    getRiskProfiles,
    calculateRisk
};