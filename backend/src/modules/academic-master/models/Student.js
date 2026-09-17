const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
    {
        rollNo: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            uppercase: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        campusId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Campus",
            required: true
        },

        branchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Branch",
            required: true
        },

        year: {
            type: Number,
            required: true
        },

        semesterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Semester",
            required: true
        },

        sectionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Section",
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Student", studentSchema);