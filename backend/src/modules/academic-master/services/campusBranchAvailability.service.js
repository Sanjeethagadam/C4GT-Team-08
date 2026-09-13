const CampusBranchAvailability = require("../models/CampusBranchAvailability");

const createAvailability = async (data) => {
    return await CampusBranchAvailability.create(data);
};

const getAllAvailability = async () => {
    return await CampusBranchAvailability.find()
        .populate("campusId")
        .populate("branchId");
};

const getAvailabilityById = async (id) => {
    return await CampusBranchAvailability.findById(id)
        .populate("campusId")
        .populate("branchId");
};

const updateAvailability = async (id, data) => {
    return await CampusBranchAvailability.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true
        }
    )
        .populate("campusId")
        .populate("branchId");
};

const deleteAvailability = async (id) => {
    return await CampusBranchAvailability.findByIdAndDelete(id);
};

module.exports = {
    createAvailability,
    getAllAvailability,
    getAvailabilityById,
    updateAvailability,
    deleteAvailability
};