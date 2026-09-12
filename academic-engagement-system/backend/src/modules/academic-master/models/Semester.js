const mongoose = require("mongoose");

const semesterSchema = new mongoose.Schema(
    {
        academicYearId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AcademicYear",
            required: true
        },

        semesterCode: {
            type: String,
            required: true,
            trim: true,
            uppercase: true
        },

        year: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE"],
            default: "ACTIVE"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Semester", semesterSchema);