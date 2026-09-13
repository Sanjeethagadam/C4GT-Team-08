const mongoose = require("mongoose");

const riskProfileSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
            unique: true
        },

        riskLevel: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
            default: "LOW",
            required: true
        },

        indicators: {
            // Overall Mid-1 and Mid-2 performance percentage
            midTrend: {
                type: Number,
                default: 0
            },

            // Mid-1 percentage
            mid1Percentage: {
                type: Number,
                default: 0
            },

            // Mid-2 percentage
            mid2Percentage: {
                type: Number,
                default: 0
            },

            // Difference between Mid-2 and Mid-1
            // Positive = improvement
            // Negative = decline
            midTrendChange: {
                type: Number,
                default: 0
            },

            failedSubjectCount: {
                type: Number,
                default: 0
            },

            repeatedFailureCount: {
                type: Number,
                default: 0
            }
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "RiskProfile",
    riskProfileSchema
);