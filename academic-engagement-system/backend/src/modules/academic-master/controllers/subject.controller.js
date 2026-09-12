const subjectService = require("../services/subject.service");

const createSubject = async (req, res) => {
    try {
        const subject = await subjectService.createSubject(req.body);

        res.status(201).json({
            success: true,
            data: subject
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
const createSubjects = async (req, res) => {
    try {
        const subjects = await subjectService.createSubjects(req.body);

        res.status(201).json({
            success: true,
            data: subjects
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
            errors: error.errors || null
        });
    }
};

const getAllSubjects = async (req, res) => {
    try {
        const filter = {};

        if (req.user && req.user.role === "CTPO") {
            if (!req.user.scopeRef || req.user.scopeRef.type !== "BRANCH" || !req.user.scopeRef.refId) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden: CTPO has no valid branch assignment"
                });
            }
            filter.branchId = req.user.scopeRef.refId;
        } else if (req.user && req.user.role === "STUDENT") {
            const Student = require("../models/Student");
            const stu = await Student.findOne({ rollNo: req.user.username });
            if (stu) {
                filter.branchId = stu.branchId;
            }
        } else if (req.query.branchId) {
            filter.branchId = req.query.branchId;
        }

        if (req.query.semesterId) filter.semesterId = req.query.semesterId;
        const subjects = await subjectService.getAllSubjects(filter);

        res.status(200).json({
            success: true,
            data: subjects
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getSubjectById = async (req, res) => {
    try {
        const subject = await subjectService.getSubjectById(req.params.id);

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found"
            });
        }

        res.status(200).json({
            success: true,
            data: subject
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const updateSubject = async (req, res) => {
    try {
        const subject = await subjectService.updateSubject(
            req.params.id,
            req.body
        );

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found"
            });
        }

        res.status(200).json({
            success: true,
            data: subject
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const deleteSubject = async (req, res) => {
    try {
        const subject = await subjectService.deleteSubject(req.params.id);

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found"
            });
        }

        res.status(200).json({
            success: true,
            data: subject
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createSubject,
    createSubjects,
    getAllSubjects,
    getSubjectById,
    updateSubject,
    deleteSubject
};