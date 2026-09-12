const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
    {
        branchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Branch",
            required: true
        },
        semesterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Semester",
            required: true
        },
        year: {
            type: Number,
            required: true,
            default: 4
        },
        timetableType: {
            type: String,
            required: true,
            enum: ["MID", "SEMESTER"],
            trim: true
        },
        midExam: {
            type: String,
            enum: ["MID-1", "MID-2", null],
            default: null
        },
        file: {
            filename: {
                type: String,
                required: true
            },
            originalName: {
                type: String,
                required: true
            },
            mimeType: {
                type: String,
                required: true,
                enum: [
                    "application/pdf",
                    "image/png",
                    "image/jpeg",
                    "image/jpg"
                ]
            },
            size: {
                type: Number,
                required: true
            },
            storage: {
                type: String,
                enum: ["GRIDFS", "LOCAL"],
                default: "GRIDFS"
            },
            gridFsId: {
                type: mongoose.Schema.Types.ObjectId,
                default: null
            },
            clusterPath: {
                type: String,
                default: null
            },
            path: {
                type: String,
                default: null
            }
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

timetableSchema.virtual("fileUrl").get(function () {
    if (this._id) {
        return `/api/timetables/${this._id}/download`;
    }
    if (this.file && this.file.filename) {
        return `/uploads/timetables/${this.file.filename}`;
    }
    return null;
});

timetableSchema.virtual("fileName").get(function () {
    return this.file ? this.file.originalName : null;
});

timetableSchema.virtual("fileType").get(function () {
    if (!this.file || !this.file.mimeType) return "unknown";
    return this.file.mimeType.includes("pdf") ? "pdf" : "image";
});

timetableSchema.virtual("uploadedAt").get(function () {
    return this.createdAt;
});

// Prevent uncontrolled duplicates for same branch + semester + year + type + mid
timetableSchema.index(
    { branchId: 1, semesterId: 1, year: 1, timetableType: 1, midExam: 1 },
    { unique: true }
);

timetableSchema.index({ branchId: 1, year: 1, semesterId: 1 });

module.exports = mongoose.model("Timetable", timetableSchema);
