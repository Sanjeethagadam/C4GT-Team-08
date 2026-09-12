const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required"
            });
        }

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password"
            });
        }

        if (user.status !== "ACTIVE") {
            return res.status(401).json({
                success: false,
                message: "Account is inactive. Please contact admin."
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password"
            });
        }

        const secret = process.env.JWT_SECRET || "academic_management_secret_key_2026";

        const token = jwt.sign(
            {
                userId: user._id,
                username: user.username,
                role: user.role
            },
            secret,
            { expiresIn: "24h" }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    role: user.role,
                    scopeRef: user.scopeRef || null,
                    status: user.status
                }
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Login failed: " + error.message
        });
    }
};

const getMe = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            data: {
                id: req.user._id,
                username: req.user.username,
                role: req.user.role,
                scopeRef: req.user.scopeRef || null,
                status: req.user.status
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get user info: " + error.message
        });
    }
};

module.exports = { login, getMe };
