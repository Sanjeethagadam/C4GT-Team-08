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
            ref: "Result",
            required: true
        },

        status: {
            type: String,
            enum: ["OPEN", "CLEARED"],
            default: "OPEN"
        }
    },
    {
        timestamps: true
    }
);

backlogSchema.index(
    { studentId: 1, subjectId: 1, semesterId: 1 },
    { unique: true }
);

module.exports = mongoose.model("Backlog", backlogSchema);