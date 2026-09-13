const Result = require("../models/Result");
const Backlog = require("../models/Backlog");
const RiskProfile = require("../models/RiskProfile");

const getAnalytics = async (req, res) => {
    try {
        const totalResults = await Result.countDocuments();

        const passResults = await Result.countDocuments({
            resultStatus: "PASS"
        });

        const failResults = await Result.countDocuments({
            resultStatus: "FAIL"
        });

        const openBacklogs = await Backlog.countDocuments({
            status: "OPEN"
        });

        const clearedBacklogs = await Backlog.countDocuments({
            status: "CLEARED"
        });

        const lowRisk = await RiskProfile.countDocuments({
            riskLevel: "LOW"
        });

        const mediumRisk = await RiskProfile.countDocuments({
            riskLevel: "MEDIUM"
        });

        const highRisk = await RiskProfile.countDocuments({
            riskLevel: "HIGH"
        });

        const criticalRisk = await RiskProfile.countDocuments({
            riskLevel: "CRITICAL"
        });

        res.status(200).json({
            success: true,
            data: {
                results: {
                    total: totalResults,
                    pass: passResults,
                    fail: failResults
                },
                backlogs: {
                    open: openBacklogs,
                    cleared: clearedBacklogs
                },
                risk: {
                    low: lowRisk,
                    medium: mediumRisk,
                    high: highRisk,
                    critical: criticalRisk
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch analytics",
            error: error.message
        });
    }
};

module.exports = {
    getAnalytics
};