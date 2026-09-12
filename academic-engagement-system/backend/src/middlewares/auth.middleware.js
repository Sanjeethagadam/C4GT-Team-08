const jwt = require("jsonwebtoken");
const User = require("../modules/academic-master/models/User");

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        let token = null;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        } else if (req.query && req.query.token) {
            token = req.query.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Missing or invalid Authorization header"
            });
        }
        const secret = process.env.JWT_SECRET || "academic_management_secret_key_2026";

        let decoded;
        try {
            decoded = jwt.verify(token, secret);
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid or expired token"
            });
        }

        const user = await User.findById(decoded.userId).select("-passwordHash");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User no longer exists"
            });
        }

        if (user.status !== "ACTIVE") {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User account is inactive"
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Authentication error: " + error.message
        });
    }
};

const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Authentication required"
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Forbidden: Access restricted to roles [${roles.join(", ")}]`
            });
        }

        next();
    };
};

const enforceScope = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: Authentication required"
        });
    }

    const { role, scopeRef } = req.user;
    req.scopeFilter = {};

    if (role === "ADMIN") {
        return next();
    }

    if (role === "PRINCIPAL") {
        if (scopeRef && scopeRef.type === "CAMPUS" && scopeRef.refId) {
            req.scopeFilter = { campusId: scopeRef.refId };
        } else {
            return res.status(403).json({
                success: false,
                message: "Forbidden: Principal user does not have a valid campus scope"
            });
        }
    } else if (role === "HOD") {
        // HOD has access to ALL BRANCHES, but ONLY YEAR 4
        req.scopeFilter = { year: 4 };
    } else if (role === "CTPO") {
        if (scopeRef && scopeRef.type === "BRANCH" && scopeRef.refId) {
            req.scopeFilter = { branchId: scopeRef.refId, year: 4 };
        } else {
            return res.status(403).json({
                success: false,
                message: "Forbidden: CTPO user does not have a valid branch scope"
            });
        }
    } else if (role === "COORDINATOR") {
        // Coordinator has READ access to ALL SUBJECTS
        req.scopeFilter = {};
    } else if (role === "STUDENT") {
        req.scopeFilter = { rollNo: req.user.username };
    }

    next();
};

module.exports = {
    authenticate,
    requireRole,
    enforceScope
};
