const Backlog = require("../models/Backlog");
const Result = require("../models/Result");


// =====================================================
// GET ALL BACKLOGS
// =====================================================

const getBacklogs = async (req, res) => {

    try {

        const backlogs = await Backlog.find()
            .populate("studentId")
            .populate("subjectId")
            .populate("semesterId")
            .populate("resultId");

        res.status(200).json({

            success: true,

            data: backlogs

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: "Failed to fetch backlogs",

            error: error.message

        });

    }
};


// =====================================================
// GET BACKLOG BY ID
// =====================================================

const getBacklogById = async (req, res) => {

    try {

        const backlog = await Backlog.findById(
            req.params.id
        )
            .populate("studentId")
            .populate("subjectId")
            .populate("semesterId")
            .populate("resultId");

        if (!backlog) {

            return res.status(404).json({

                success: false,

                message: "Backlog not found"

            });

        }

        res.status(200).json({

            success: true,

            data: backlog

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: "Failed to fetch backlog",

            error: error.message

        });

    }
};


// =====================================================
// REPAIR BACKLOG SUBJECT ID
// =====================================================

const repairBacklogSubject = async (req, res) => {

    try {

        const backlog = await Backlog.findById(
            req.params.id
        );

        if (!backlog) {

            return res.status(404).json({

                success: false,

                message: "Backlog not found"

            });

        }


        // If subjectId already exists
        if (backlog.subjectId) {

            const updatedBacklog =
                await Backlog.findById(backlog._id)
                    .populate("studentId")
                    .populate("subjectId")
                    .populate("semesterId")
                    .populate("resultId");

            return res.status(200).json({

                success: true,

                message: "Backlog already has a subject",

                data: updatedBacklog

            });

        }


        // Find related result
        const result = await Result.findById(
            backlog.resultId
        );

        if (!result) {

            return res.status(404).json({

                success: false,

                message: "Related result not found"

            });

        }


        // Check subjectId in result
        if (!result.subjectId) {

            return res.status(400).json({

                success: false,

                message:
                    "Related result does not contain subjectId"

            });

        }


        // Copy subjectId from Result
        backlog.subjectId = result.subjectId;

        await backlog.save();


        // Fetch updated backlog
        const updatedBacklog =
            await Backlog.findById(backlog._id)
                .populate("studentId")
                .populate("subjectId")
                .populate("semesterId")
                .populate("resultId");


        res.status(200).json({

            success: true,

            message:
                "Backlog subject repaired successfully",

            data: updatedBacklog

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message:
                "Failed to repair backlog subject",

            error: error.message

        });

    }
};


// =====================================================
// CLEAR BACKLOG
// =====================================================

const clearBacklog = async (req, res) => {

    try {

        const backlog = await Backlog.findById(
            req.params.id
        );

        if (!backlog) {

            return res.status(404).json({

                success: false,

                message: "Backlog not found"

            });

        }


        // Check whether already cleared
        if (backlog.status === "CLEARED") {

            return res.status(400).json({

                success: false,

                message: "Backlog is already cleared"

            });

        }


        // Change status
        backlog.status = "CLEARED";

        await backlog.save();


        // Fetch updated backlog
        const updatedBacklog =
            await Backlog.findById(backlog._id)
                .populate("studentId")
                .populate("subjectId")
                .populate("semesterId")
                .populate("resultId");


        res.status(200).json({

            success: true,

            message:
                "Backlog cleared successfully",

            data: updatedBacklog

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message:
                "Failed to clear backlog",

            error: error.message

        });

    }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    getBacklogs,

    getBacklogById,

    repairBacklogSubject,

    clearBacklog

};