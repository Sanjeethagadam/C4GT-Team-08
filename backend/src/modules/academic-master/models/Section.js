const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
    {
        branchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Branch",
            required: true
        },

        year: {
            type: Number,
            required: true
        },

        sectionName: {
            type: String,
            required: true,
            trim: true,
            uppercase: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Section", sectionSchema);