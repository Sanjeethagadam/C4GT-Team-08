const Result = require("../models/Result");
const Backlog = require("../models/Backlog");

// GET all results
const getResults = async (req, res) => {
    try {
        const results = await Result.find()
            .populate("studentId")
            .populate("subjectId")
            .populate("semesterId");

        res.status(200).json({
            success: true,
            data: results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch results",
            error: error.message
        });
    }
};

// GET result by ID
const getResultById = async (req, res) => {
    try {
        const result = await Result.findById(req.params.id)
            .populate("studentId")
            .populate("subjectId")
            .populate("semesterId");

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Result not found"
            });
        }

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch result",
            error: error.message
        });
    }
};

// CREATE result
const createResult = async (req, res) => {
    try {
        const result = await Result.create(req.body);

        if (result.resultStatus === "FAIL") {
            await Backlog.findOneAndUpdate(
                {
                    studentId: result.studentId,
                    subjectId: result.subjectId,
                    semesterId: result.semesterId
                },
                {
                    studentId: result.studentId,
                    subjectId: result.subjectId,
                    semesterId: result.semesterId,
                    resultId: result._id,
                    status: "OPEN"
                },
                {
                    upsert: true,
                    new: true
                }
            );
        }

        res.status(201).json({
            success: true,
            data: result
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to create result",
            error: error.message
        });
    }
};

module.exports = {
    getResults,
    getResultById,
    createResult
};