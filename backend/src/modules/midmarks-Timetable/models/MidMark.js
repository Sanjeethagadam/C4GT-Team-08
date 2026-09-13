const mongoose = require("mongoose");

const midMarkSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },
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
        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: true
        },
        midExam: {
            type: String,
            required: true,
            enum: ["MID-1", "MID-2"],
            trim: true
        },
        marks: {
            type: Number,
            required: true,
            min: 0
        },
        maxMarks: {
            type: Number,
            default: 30,
            min: 1
        },
        enteredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

// Prevent duplicate mark entry for same student + semester + subject + midExam
midMarkSchema.index(
    { studentId: 1, semesterId: 1, subjectId: 1, midExam: 1 },
    { unique: true }
);

midMarkSchema.index({ branchId: 1, semesterId: 1 });
midMarkSchema.index({ studentId: 1 });

module.exports = mongoose.model("MidMark", midMarkSchema);
