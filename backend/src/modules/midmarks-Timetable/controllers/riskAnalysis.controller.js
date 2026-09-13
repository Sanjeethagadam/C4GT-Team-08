const riskAnalysisService = require("../services/riskAnalysis.service");

const getBranchRiskAnalysis = async (req, res) => {
    try {
        const branchId = req.query.branchId;
        const analysis = await riskAnalysisService.calculateBranchRiskAnalysis(
            branchId,
            req.user
        );

        res.status(200).json({
            success: true,
            data: analysis
        });
    } catch (error) {
        const statusCode = error.message.startsWith("Forbidden") ? 403 : 400;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getBranchRiskAnalysis
};
