const branchService = require("../services/branch.service");

const createBranch = async (req, res) => {
    try {
        const branch = await branchService.createBranch(req.body);

        res.status(201).json({
            success: true,
            data: branch
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
            errors: []
        });
    }
};

const getAllBranches = async (req, res) => {
    try {
        const branches = await branchService.getAllBranches();

        res.json({
            success: true,
            data: branches
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            errors: []
        });
    }
};

const getBranchById = async (req, res) => {
    try {
        const branch = await branchService.getBranchById(req.params.id);

        if (!branch) {
            return res.status(404).json({
                success: false,
                message: "Branch not found",
                errors: []
            });
        }

        res.json({
            success: true,
            data: branch
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
            errors: []
        });
    }
};

const updateBranch = async (req, res) => {
    try {
        const branch = await branchService.updateBranch(
            req.params.id,
            req.body
        );

        if (!branch) {
            return res.status(404).json({
                success: false,
                message: "Branch not found",
                errors: []
            });
        }

        res.json({
            success: true,
            data: branch
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
            errors: []
        });
    }
};

const deleteBranch = async (req, res) => {
    try {
        const branch = await branchService.deleteBranch(req.params.id);

        if (!branch) {
            return res.status(404).json({
                success: false,
                message: "Branch not found",
                errors: []
            });
        }

        res.json({
            success: true,
            data: branch
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
    createBranch,
    getAllBranches,
    getBranchById,
    updateBranch,
    deleteBranch
};