const subjectService = require("../services/subject.service");

const createSubject = async (req, res) => {
    try {
        if (Array.isArray(req.body) || (req.body && Array.isArray(req.body.subjects))) {
            const result = await subjectService.createSubjects(req.body);
            return res.status(201).json({
                success: true,
                message: `Subjects process summary: ${result.insertedCount || 0} inserted, ${result.skippedCount || 0} skipped`,
                insertedCount: result.insertedCount,
                skippedCount: result.skippedCount,
                totalCount: result.totalCount,
                data: result.data || result
            });
        }

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
        const result = await subjectService.createSubjects(req.body);

        res.status(201).json({
            success: true,
            message: `Subjects process summary: ${result.insertedCount || 0} inserted, ${result.skippedCount || 0} skipped`,
            insertedCount: result.insertedCount,
            skippedCount: result.skippedCount,
            totalCount: result.totalCount,
            data: result.data || result
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
            errors: error.errors || null
        });
    }
};

const seedSubjectsFromPdf = async (req, res) => {
    try {
        const result = await subjectService.seedPDFSubjects();

        res.status(201).json({
            success: true,
            message: `PDF Subjects Seeding Complete`,
            insertedCount: result.insertedCount,
            skippedCount: result.skippedCount,
            totalCount: result.totalCount,
            branchCounts: result.branchCounts,
            branchSemesterCounts: result.branchSemesterCounts,
            count4_1: result.count4_1
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getAllSubjects = async (req, res) => {
    try {
        const subjects = await subjectService.getAllSubjects();

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
    seedSubjectsFromPdf,
    getAllSubjects,
    getSubjectById,
    updateSubject,
    deleteSubject
};