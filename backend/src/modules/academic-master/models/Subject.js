const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
    {
         subjectCode: {
            type: String,
            required: true,
            trim: true,
            uppercase: true
        },
        
        subjectName: {
            type: String,
            required: true,
            trim: true
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
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Subject", subjectSchema);