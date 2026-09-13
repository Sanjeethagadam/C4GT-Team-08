const express = require("express");

const router = express.Router();

const {
    getResults,
    getResultById,
    createResult
} = require("../controllers/resultController");

// GET all results
router.get("/", getResults);

// GET result by ID
router.get("/:id", getResultById);

// CREATE result
router.post("/", createResult);

module.exports = router;