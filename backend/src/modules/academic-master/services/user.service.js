const bcrypt = require("bcrypt");
const User = require("../models/User");
const Student = require("../models/Student");
const Campus = require("../models/Campus");
const Branch = require("../models/Branch");
const Section = require("../models/Section");

const validateUserScope = (role, scopeRef) => {
    if (role === "CTPO") {
        if (!scopeRef || scopeRef.type !== "SECTION" || !scopeRef.refId) {
            throw new Error("CTPO role requires a valid scopeRef of type 'SECTION' with refId");
        }
    } else if (role === "PRINCIPAL") {
        if (!scopeRef || scopeRef.type !== "CAMPUS" || !scopeRef.refId) {
            throw new Error("PRINCIPAL role requires a valid scopeRef of type 'CAMPUS' with refId");
        }
    }
};

const createUser = async (data) => {
    const { username, password, role, scopeRef } = data;

    if (!username || !role) {
        throw new Error("Username and role are required");
    }

    const validRoles = ["STUDENT", "CTPO", "HOD", "PRINCIPAL", "COORDINATOR", "ADMIN"];
    if (!validRoles.includes(role)) {
        throw new Error(`Invalid role. Must be one of: ${validRoles.join(", ")}`);
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
        throw new Error("Username already exists");
    }

    if (role === "STUDENT") {
        const student = await Student.findOne({ rollNo: username });
        if (!student) {
            throw new Error("Student with this roll number not found");
        }
    }

    validateUserScope(role, scopeRef);

    const initialPassword = password || username;
    const passwordHash = await bcrypt.hash(initialPassword, 10);

    const user = await User.create({
        username,
        passwordHash,
        role,
        scopeRef: scopeRef || null,
        status: data.status || "ACTIVE"
    });

    return {
        id: user._id,
        username: user.username,
        role: user.role,
        scopeRef: user.scopeRef || null,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
};

const getAllUsers = async () => {
    const users = await User.find().select("-passwordHash");
    return users.map((user) => ({
        id: user._id,
        username: user.username,
        role: user.role,
        scopeRef: user.scopeRef || null,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    }));
};

const getUserById = async (id) => {
    const user = await User.findById(id).select("-passwordHash");
    if (!user) return null;

    return {
        id: user._id,
        username: user.username,
        role: user.role,
        scopeRef: user.scopeRef || null,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
};

const updateUser = async (id, data) => {
    const user = await User.findById(id);
    if (!user) return null;

    const updateFields = {};

    if (data.username && data.username !== user.username) {
        const existingUser = await User.findOne({ username: data.username });
        if (existingUser) {
            throw new Error("Username already exists");
        }
        updateFields.username = data.username;
    }

    const updatedRole = data.role || user.role;
    const updatedScope = data.scopeRef !== undefined ? data.scopeRef : user.scopeRef;

    validateUserScope(updatedRole, updatedScope);

    if (data.role) updateFields.role = data.role;
    if (data.scopeRef !== undefined) updateFields.scopeRef = data.scopeRef;
    if (data.status) updateFields.status = data.status;

    if (data.password) {
        updateFields.passwordHash = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
        id,
        updateFields,
        { new: true, runValidators: true }
    ).select("-passwordHash");

    return {
        id: updatedUser._id,
        username: updatedUser.username,
        role: updatedUser.role,
        scopeRef: updatedUser.scopeRef || null,
        status: updatedUser.status,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
    };
};

const syncStudentUsers = async () => {
    const students = await Student.find();
    let createdCount = 0;
    let skippedCount = 0;

    for (const student of students) {
        const existingUser = await User.findOne({ username: student.rollNo });
        if (!existingUser) {
            const passwordHash = await bcrypt.hash(student.rollNo, 10);
            await User.create({
                username: student.rollNo,
                passwordHash,
                role: "STUDENT",
                status: "ACTIVE"
            });
            createdCount++;
        } else {
            skippedCount++;
        }
    }

    return { createdCount, skippedCount, totalStudents: students.length };
};

const seedSystemUsers = async () => {
    // 1. PRINCIPAL Account (2KKT01) -> KIET Campus
    const kietCampus = await Campus.findOne({ code: "KIET" });
    if (kietCampus) {
        const existingPrincipal = await User.findOne({ username: "2KKT01" });
        if (!existingPrincipal) {
            const passwordHash = await bcrypt.hash("2KKT01", 10);
            await User.create({
                username: "2KKT01",
                passwordHash,
                role: "PRINCIPAL",
                scopeRef: { type: "CAMPUS", refId: kietCampus._id },
                status: "ACTIVE"
            });
        } else if (existingPrincipal.scopeRef?.type !== "CAMPUS" || existingPrincipal.scopeRef?.refId?.toString() !== kietCampus._id.toString()) {
            await User.findByIdAndUpdate(existingPrincipal._id, {
                scopeRef: { type: "CAMPUS", refId: kietCampus._id }
            });
        }
    }

    // 2. HOD Account (2KHT01) -> ALL BRANCHES, YEAR 4
    const existingHOD = await User.findOne({ username: "2KHT01" });
    if (!existingHOD) {
        const passwordHash = await bcrypt.hash("2KHT01", 10);
        await User.create({
            username: "2KHT01",
            passwordHash,
            role: "HOD",
            scopeRef: null,
            status: "ACTIVE"
        });
    } else if (existingHOD.scopeRef !== null) {
        await User.findByIdAndUpdate(existingHOD._id, { scopeRef: null });
    }

    // 3. COORDINATOR Account (2KGET01) -> ALL SUBJECTS
    const existingCoord = await User.findOne({ username: "2KGET01" });
    if (!existingCoord) {
        const passwordHash = await bcrypt.hash("2KGET01", 10);
        await User.create({
            username: "2KGET01",
            passwordHash,
            role: "COORDINATOR",
            scopeRef: null,
            status: "ACTIVE"
        });
    } else if (existingCoord.scopeRef !== null) {
        await User.findByIdAndUpdate(existingCoord._id, { scopeRef: null });
    }

    // 4. CTPO Accounts Migration & Seeding
    const ctpoConfigs = [
        { newUsername: "2KCT01", oldUsername: "2KCT01-CSM-section", branchCode: "CSM" },
        { newUsername: "2KCT02", oldUsername: "2KCT02-CAI-section", branchCode: "CAI" },
        { newUsername: "2KCT03", oldUsername: "2KCT03-CSD-section", branchCode: "CSD" },
        { newUsername: "2KCT04", oldUsername: "2KCT04-AID-section", branchCode: "AID" },
        { newUsername: "2KCT05", oldUsername: "2KCT05-CSC-section", branchCode: "CSC" }
    ];

    for (const cfg of ctpoConfigs) {
        const branch = await Branch.findOne({ code: cfg.branchCode });
        if (!branch) {
            continue;
        }

        const section = await Section.findOne({ branchId: branch._id });
        if (!section) {
            continue;
        }

        // Check if old username account exists
        const oldAccount = await User.findOne({ username: cfg.oldUsername });
        const newPasswordHash = await bcrypt.hash(cfg.newUsername, 10);

        if (oldAccount) {
            // Rename old account to new username
            await User.findByIdAndUpdate(oldAccount._id, {
                username: cfg.newUsername,
                passwordHash: newPasswordHash,
                role: "CTPO",
                scopeRef: { type: "SECTION", refId: section._id },
                status: "ACTIVE"
            });
        } else {
            // Check if new username exists
            const existingNewAccount = await User.findOne({ username: cfg.newUsername });
            if (!existingNewAccount) {
                await User.create({
                    username: cfg.newUsername,
                    passwordHash: newPasswordHash,
                    role: "CTPO",
                    scopeRef: { type: "SECTION", refId: section._id },
                    status: "ACTIVE"
                });
            } else {
                await User.findByIdAndUpdate(existingNewAccount._id, {
                    role: "CTPO",
                    scopeRef: { type: "SECTION", refId: section._id },
                    status: "ACTIVE"
                });
            }
        }
    }

    // 5. Admin Account (admin_test)
    const existingAdmin = await User.findOne({ username: "admin_test" });
    if (!existingAdmin) {
        const adminPasswordHash = await bcrypt.hash("admin123", 10);
        await User.create({
            username: "admin_test",
            passwordHash: adminPasswordHash,
            role: "ADMIN",
            status: "ACTIVE"
        });
    }

    // 6. Sync all Student accounts
    await syncStudentUsers();
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    syncStudentUsers,
    seedSystemUsers
};