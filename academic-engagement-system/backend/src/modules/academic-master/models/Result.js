const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
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
        resultStatus: {
            type: String,
            default: "FAIL"
        },
        grade: {
            type: String,
            default: "F"
        },
        source: {
            type: String,
            default: "MANUAL"
        }
    },
    {
        timestamps: true
    }
);

resultSchema.index({ studentId: 1 });
resultSchema.index({ semesterId: 1 });

module.exports = mongoose.model("Result", resultSchema);
