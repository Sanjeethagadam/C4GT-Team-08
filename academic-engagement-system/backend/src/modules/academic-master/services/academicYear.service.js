const AcademicYear = require("../models/AcademicYear");

const createAcademicYear = async (data) => {
    return await AcademicYear.create(data);
};

const getAllAcademicYears = async () => {
    return await AcademicYear.find();
};

const getAcademicYearById = async (id) => {
    return await AcademicYear.findById(id);
};

const updateAcademicYear = async (id, data) => {
    return await AcademicYear.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true
        }
    );
};

const deleteAcademicYear = async (id) => {
    return await AcademicYear.findByIdAndDelete(id);
};

module.exports = {
    createAcademicYear,
    getAllAcademicYears,
    getAcademicYearById,
    updateAcademicYear,
    deleteAcademicYear
};