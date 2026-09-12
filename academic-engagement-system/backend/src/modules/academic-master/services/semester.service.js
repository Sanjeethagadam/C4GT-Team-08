const Semester = require("../models/Semester");

const createSemester = async (data) => {
    return await Semester.create(data);
};

const getAllSemesters = async () => {
    return await Semester.find()
        .populate("academicYearId");
};

const getSemesterById = async (id) => {
    return await Semester.findById(id)
        .populate("academicYearId");
};

const updateSemester = async (id, data) => {
    return await Semester.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true
        }
    ).populate("academicYearId");
};

const deleteSemester = async (id) => {
    return await Semester.findByIdAndDelete(id);
};

module.exports = {
    createSemester,
    getAllSemesters,
    getSemesterById,
    updateSemester,
    deleteSemester
};