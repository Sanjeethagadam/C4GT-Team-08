const mongoose = require("mongoose");

const riskThresholdSchema = new mongoose.Schema(
    {
        critical: {
            backlogCount: {
                type: Number,
                default: 4
            },

            repeatedFailureCount: {
                type: Number,
                default: 2
            },

            midTrendBelow: {
                type: Number,
                default: 40
            }
        },

        high: {
            backlogCount: {
                type: Number,
                default: 3
            },

            repeatedFailureCount: {
                type: Number,
                default: 1
            },

            midTrendBelow: {
                type: Number,
                default: 50
            }
        },

        medium: {
            backlogCount: {
                type: Number,
                default: 1
            },

            midTrendBelow: {
                type: Number,
                default: 60
            }
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "RiskThreshold",
    riskThresholdSchema
);