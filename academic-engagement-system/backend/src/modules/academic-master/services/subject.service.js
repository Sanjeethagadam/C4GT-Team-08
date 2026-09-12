const Subject = require("../models/Subject");

const createSubject = async (data) => {
    return await Subject.create(data);
};

const createSubjects = async (data) => {
    return await Subject.insertMany(data);
};

const getAllSubjects = async (filter = {}) => {
    return await Subject.find(filter)
        .populate("branchId", "name code")
        .populate("semesterId", "semesterCode year");
};

const getSubjectById = async (id) => {
    return await Subject.findById(id);
};

const updateSubject = async (id, data) => {
    return await Subject.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true
        }
    );
};

const deleteSubject = async (id) => {
    return await Subject.findByIdAndDelete(id);
};

module.exports = {
    createSubject,
    createSubjects,
    getAllSubjects,
    getSubjectById,
    updateSubject,
    deleteSubject
};