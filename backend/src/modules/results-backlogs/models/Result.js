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
            enum: ["PASS", "FAIL"],
            required: true
        },

        grade: {
            type: String,
            trim: true
        },

        source: {
            type: String,
            enum: ["JNTUK_IMPORT", "MANUAL"],
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Result", resultSchema);