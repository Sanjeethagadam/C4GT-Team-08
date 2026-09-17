const Student = require("../models/Student");
const Campus = require("../models/Campus");
const Branch = require("../models/Branch");
const Semester = require("../models/Semester");
const Section = require("../models/Section");
const CampusBranchAvailability = require("../models/CampusBranchAvailability");

const validateCampusBranchAvailability = async (campusId, branchId) => {
    if (campusId && branchId) {
        const availability = await CampusBranchAvailability.findOne({
            campusId,
            branchId
        });

        if (!availability || availability.isAvailable === false) {
            throw new Error("Campus and Branch combination is not available");
        }
    }
};

const createStudent = async (data, user = null) => {
    if (user && user.role === "CTPO") {
        if (!data.sectionId || !user.scopeRef?.refId || data.sectionId.toString() !== user.scopeRef.refId.toString()) {
            throw new Error("Forbidden: CTPO can manage students only in the assigned section");
        }
    }

    await validateCampusBranchAvailability(data.campusId, data.branchId);
    return await Student.create(data);
};

const createStudents = async (data, user = null) => {
    if (Array.isArray(data)) {
        for (const item of data) {
            if (user && user.role === "CTPO") {
                if (!item.sectionId || !user.scopeRef?.refId || item.sectionId.toString() !== user.scopeRef.refId.toString()) {
                    throw new Error("Forbidden: CTPO can manage students only in the assigned section");
                }
            }
            await validateCampusBranchAvailability(item.campusId, item.branchId);
        }
    }
    return await Student.insertMany(data);
};

const getAllStudents = async (filter = {}) => {
    return await Student.find(filter)
        .populate("campusId", "name code")
        .populate("branchId", "name code")
        .populate("semesterId", "semesterCode year")
        .populate("sectionId", "sectionName year");
};

const getStudentById = async (id, user = null) => {
    const student = await Student.findById(id)
        .populate("campusId", "name code")
        .populate("branchId", "name code")
        .populate("semesterId", "semesterCode year")
        .populate("sectionId", "sectionName year");

    if (!student) return null;

    if (user) {
        const { role, username, scopeRef } = user;

        if (role === "STUDENT" && student.rollNo !== username) {
            throw new Error("Forbidden: Access denied to other student records");
        }

        if (role === "CTPO") {
            const studentSectionId = student.sectionId?._id ? student.sectionId._id.toString() : student.sectionId?.toString();
            if (
                !scopeRef ||
                scopeRef.type !== "SECTION" ||
                studentSectionId !== scopeRef.refId.toString()
            ) {
                throw new Error("Forbidden: Access denied outside your section scope");
            }
        }

        if (role === "HOD") {
            if (student.year !== 4) {
                throw new Error("Forbidden: HOD access is restricted to 4th-year student records ONLY");
            }
        }

        if (role === "PRINCIPAL") {
            const studentCampusId = student.campusId?._id ? student.campusId._id.toString() : student.campusId?.toString();
            if (
                !scopeRef ||
                scopeRef.type !== "CAMPUS" ||
                studentCampusId !== scopeRef.refId.toString()
            ) {
                throw new Error("Forbidden: Access denied outside your assigned campus scope");
            }
        }
    }

    return student;
};

const updateStudent = async (id, data, user = null) => {
    const student = await Student.findById(id);
    if (!student) return null;

    if (user && user.role === "CTPO") {
        const studentSectionId = student.sectionId?._id ? student.sectionId._id.toString() : student.sectionId?.toString();
        if (!user.scopeRef?.refId || studentSectionId !== user.scopeRef.refId.toString()) {
            throw new Error("Forbidden: CTPO can manage students only in the assigned section");
        }
        if (data.sectionId && data.sectionId.toString() !== user.scopeRef.refId.toString()) {
            throw new Error("Forbidden: CTPO can manage students only in the assigned section");
        }
    }

    const campusId = data.campusId || (student.campusId?._id || student.campusId);
    const branchId = data.branchId || (student.branchId?._id || student.branchId);

    await validateCampusBranchAvailability(campusId, branchId);

    return await Student.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true
    })
        .populate("campusId", "name code")
        .populate("branchId", "name code")
        .populate("semesterId", "semesterCode year")
        .populate("sectionId", "sectionName year");
};

const deleteStudent = async (id, user = null) => {
    const student = await Student.findById(id);
    if (!student) return null;

    if (user && user.role === "CTPO") {
        const studentSectionId = student.sectionId?._id ? student.sectionId._id.toString() : student.sectionId?.toString();
        if (!user.scopeRef?.refId || studentSectionId !== user.scopeRef.refId.toString()) {
            throw new Error("Forbidden: CTPO can manage students only in the assigned section");
        }
    }

    return await Student.findByIdAndDelete(id);
};

module.exports = {
    createStudent,
    createStudents,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    validateCampusBranchAvailability
};