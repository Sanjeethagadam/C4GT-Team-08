const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        passwordHash: {
            type: String,
            required: true
        },

        role: {
            type: String,
            required: true,
            enum: [
                "STUDENT",
                "CTPO",
                "HOD",
                "PRINCIPAL",
                "COORDINATOR",
                "ADMIN"
            ]
        },

        scopeRef: {
            type: {
                type: String,
                enum: ["CAMPUS", "SECTION", "BRANCH", "SUBJECT"]
            },
            refId: {
                type: mongoose.Schema.Types.ObjectId
            }
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

module.exports = mongoose.model("User", userSchema);