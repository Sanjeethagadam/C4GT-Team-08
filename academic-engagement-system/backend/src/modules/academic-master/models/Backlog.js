const mongoose = require("mongoose");

const backlogSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },
        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: true
        },
        semesterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Semester",
            required: true
        },
        resultId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Result"
        },
        status: {
            type: String,
            default: "OPEN",
            trim: true
        }
    },
    {
        timestamps: true
    }
);

backlogSchema.index({ studentId: 1 });
backlogSchema.index({ semesterId: 1 });
backlogSchema.index({ studentId: 1, subjectId: 1, semesterId: 1 }, { unique: true });

module.exports = mongoose.model("Backlog", backlogSchema);
