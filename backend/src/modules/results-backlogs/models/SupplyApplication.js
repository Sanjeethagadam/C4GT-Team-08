const mongoose = require("mongoose");

const supplyApplicationSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },

        backlogId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Backlog",
            required: true
        },

        applicationStatus: {
            type: String,
            enum: [
                "NotApplied",
                "Applied",
                "PaymentPending",
                "Confirmed"
            ],
            default: "NotApplied",
            required: true
        },

        deadline: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "SupplyApplication",
    supplyApplicationSchema
);