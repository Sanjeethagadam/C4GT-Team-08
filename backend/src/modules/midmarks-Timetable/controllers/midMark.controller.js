const midMarkService = require("../services/midMark.service");

const enterMidMarks = async (req, res) => {
    try {
        const result = await midMarkService.enterMidMarks(req.body, req.user);
        res.status(201).json({
            success: true,
            message: "Mid marks recorded successfully",
            data: result
        });
    } catch (error) {
        const statusCode = error.message.startsWith("Forbidden") ? 403 : 400;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

const updateMidMark = async (req, res) => {
    try {
        const updated = await midMarkService.updateMidMark(req.params.id, req.body, req.user);
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Mid mark record not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Mid mark updated successfully",
            data: updated
        });
    } catch (error) {
        const statusCode = error.message.startsWith("Forbidden") ? 403 : 400;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

const getStudentMidMarks = async (req, res) => {
    try {
        const result = await midMarkService.getStudentMidMarks(req.params.studentId, req.user);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        const statusCode = error.message.startsWith("Forbidden") ? 403 : (error.message.includes("not found") ? 404 : 400);
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

const getBranchMidMarks = async (req, res) => {
    try {
        const filter = {
            semesterId: req.query.semesterId,
            midExam: req.query.midExam,
            studentId: req.query.studentId,
            branchId: req.query.branchId
        };
        const marks = await midMarkService.getBranchMidMarks(filter, req.user);
        res.status(200).json({
            success: true,
            count: marks.length,
            data: marks
        });
    } catch (error) {
        const statusCode = error.message.startsWith("Forbidden") ? 403 : 400;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

const getMyMidMarks = async (req, res) => {
    try {
        const data = await midMarkService.getMyMidMarks(req.user);
        res.status(200).json({
            success: true,
            data
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
    enterMidMarks,
    updateMidMark,
    getStudentMidMarks,
    getBranchMidMarks,
    getMyMidMarks
};
