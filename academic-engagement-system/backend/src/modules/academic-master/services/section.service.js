const Section = require("../models/Section");

const createSection = async (data) => {
    return await Section.create(data);
};

const getAllSections = async () => {
    return await Section.find()
        .populate("branchId");
};

const getSectionById = async (id) => {
    return await Section.findById(id)
        .populate("branchId");
};

const updateSection = async (id, data) => {
    return await Section.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true
        }
    ).populate("branchId");
};

const deleteSection = async (id) => {
    return await Section.findByIdAndDelete(id);
};

module.exports = {
    createSection,
    getAllSections,
    getSectionById,
    updateSection,
    deleteSection
};