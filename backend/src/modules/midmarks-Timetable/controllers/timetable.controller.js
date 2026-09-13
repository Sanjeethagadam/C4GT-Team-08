const path = require("path");
const fs = require("fs");
const timetableService = require("../services/timetable.service");

const uploadTimetable = async (req, res) => {
    try {
        const timetable = await timetableService.uploadTimetable(
            req.body,
            req.file,
            req.user
        );

        res.status(201).json({
            success: true,
            message: "Timetable uploaded successfully",
            data: timetable
        });
    } catch (error) {
        // Clean up temporary file if upload processing failed
        if (req.file?.path && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (e) {}
        }

        const statusCode = error.message.startsWith("Forbidden") ? 403 : 400;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

const getBranchTimetables = async (req, res) => {
    try {
        const filter = {
            branchId: req.query.branchId,
            semesterId: req.query.semesterId,
            timetableType: req.query.timetableType,
            midExam: req.query.midExam,
            year: req.query.year
        };

        const timetables = await timetableService.getBranchTimetables(filter, req.user);
        res.status(200).json({
            success: true,
            count: timetables.length,
            data: timetables
        });
    } catch (error) {
        const statusCode = error.message.startsWith("Forbidden") ? 403 : 400;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

const getMyTimetable = async (req, res) => {
    try {
        const data = await timetableService.getMyTimetable(req.user);
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

const getTimetableById = async (req, res) => {
    try {
        const timetable = await timetableService.getTimetableById(req.params.id, req.user);
        if (!timetable) {
            return res.status(404).json({
                success: false,
                message: "Timetable not found"
            });
        }

        res.status(200).json({
            success: true,
            data: timetable
        });
    } catch (error) {
        const statusCode = error.message.startsWith("Forbidden") ? 403 : 400;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

const downloadTimetableFile = async (req, res) => {
    try {
        const timetable = await timetableService.getTimetableById(req.params.id, req.user);
        if (!timetable) {
            return res.status(404).json({
                success: false,
                message: "Timetable not found"
            });
        }

        let filePath = timetable.file?.path;
        if (!filePath || !fs.existsSync(filePath)) {
            const filename = timetable.file?.filename || "";
            const candidate1 = path.join(__dirname, "../../../../uploads/timetables", filename);
            const candidate2 = path.join(process.cwd(), "uploads/timetables", filename);
            const candidate3 = path.join(process.cwd(), "backend/uploads/timetables", filename);

            if (fs.existsSync(candidate1)) {
                filePath = candidate1;
            } else if (fs.existsSync(candidate2)) {
                filePath = candidate2;
            } else if (fs.existsSync(candidate3)) {
                filePath = candidate3;
            }
        }

        if (!filePath || !fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: "Timetable physical file not found on server"
            });
        }

        const mimeType = timetable.file?.mimeType || (timetable.file?.filename?.endsWith(".pdf") ? "application/pdf" : "image/jpeg");
        res.setHeader("Content-Type", mimeType);
        res.setHeader(
            "Content-Disposition",
            `inline; filename="${timetable.file?.originalName || "timetable"}"`
        );

        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } catch (error) {
        const statusCode = error.message.startsWith("Forbidden") ? 403 : 400;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

const deleteTimetable = async (req, res) => {
    try {
        const deleted = await timetableService.deleteTimetable(req.params.id, req.user);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Timetable not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Timetable deleted successfully"
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
    uploadTimetable,
    getBranchTimetables,
    getMyTimetable,
    getTimetableById,
    downloadTimetableFile,
    deleteTimetable
};
