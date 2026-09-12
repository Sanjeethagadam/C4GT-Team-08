const Campus = require("../models/Campus");

const createCampus = async (data) => {
    return await Campus.create(data);
};

const getAllCampuses = async () => {
    return await Campus.find();
};

const getCampusById = async (id) => {
    return await Campus.findById(id);
};

const updateCampus = async (id, data) => {
    return await Campus.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true
        }
    );
};

const deleteCampus = async (id) => {
    return await Campus.findByIdAndDelete(id);
};

module.exports = {
    createCampus,
    getAllCampuses,
    getCampusById,
    updateCampus,
    deleteCampus
};