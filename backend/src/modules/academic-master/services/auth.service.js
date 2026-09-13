const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const loginUser = async (username, password) => {
    if (!username || !password) {
        throw new Error("Username and password are required");
    }

    const user = await User.findOne({ username });

    if (!user) {
        throw new Error("Invalid username or password");
    }

    if (user.status !== "ACTIVE") {
        throw new Error("User account is inactive");
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
        throw new Error("Invalid username or password");
    }

    const secret = process.env.JWT_SECRET || "academic_management_secret_key_2026";
    const expiresIn = process.env.JWT_EXPIRES_IN || "24h";

    const token = jwt.sign(
        {
            userId: user._id,
            username: user.username,
            role: user.role
        },
        secret,
        { expiresIn }
    );

    return {
        token,
        user: {
            id: user._id,
            username: user.username,
            role: user.role,
            scopeRef: user.scopeRef || null,
            status: user.status
        }
    };
};

module.exports = {
    loginUser
};
