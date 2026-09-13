const sectionService = require("../services/section.service");

const createSection = async (req, res) => {
    try {
        const section = await sectionService.createSection(req.body);

        res.status(201).json({
            success: true,
            data: section
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
            errors: []
        });
    }
};

const getAllSections = async (req, res) => {
    try {
        const sections = await sectionService.getAllSections();

        res.json({
            success: true,
            data: sections
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            errors: []
        });
    }
};

const getSectionById = async (req, res) => {
    try {
        const section = await sectionService.getSectionById(
            req.params.id
        );

        if (!section) {
            return res.status(404).json({
                success: false,
                message: "Section not found",
                errors: []
            });
        }

        res.json({
            success: true,
            data: section
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
            errors: []
        });
    }
};

const updateSection = async (req, res) => {
    try {
        const section = await sectionService.updateSection(
            req.params.id,
            req.body
        );

        if (!section) {
            return res.status(404).json({
                success: false,
                message: "Section not found",
                errors: []
            });
        }

        res.json({
            success: true,
            data: section
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
            errors: []
        });
    }
};

const deleteSection = async (req, res) => {
    try {
        const section = await sectionService.deleteSection(
            req.params.id
        );

        if (!section) {
            return res.status(404).json({
                success: false,
                message: "Section not found",
                errors: []
            });
        }

        res.json({
            success: true,
            data: section
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
            errors: []
        });
    }
};

module.exports = {
    createSection,
    getAllSections,
    getSectionById,
    updateSection,
    deleteSection
};