const Branch = require("../models/Branch");

const createBranch = async (data) => {
    return await Branch.create(data);
};

const getAllBranches = async () => {
    return await Branch.find();
};

const getBranchById = async (id) => {
    return await Branch.findById(id);
};

const updateBranch = async (id, data) => {
    return await Branch.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true
        }
    );
};

const deleteBranch = async (id) => {
    return await Branch.findByIdAndDelete(id);
};

module.exports = {
    createBranch,
    getAllBranches,
    getBranchById,
    updateBranch,
    deleteBranch
};