const dashboardService = require("../services/dashboard.service");

const getDashboard = async (req, res) => {
    try {
        const data = await dashboardService.getDashboardData(req.user);

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getDashboard
};
