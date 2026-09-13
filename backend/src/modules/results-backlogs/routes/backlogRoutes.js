const express = require("express");

const router = express.Router();

const {
    getBacklogs,
    getBacklogById,
    repairBacklogSubject,
    clearBacklog
} = require("../controllers/backlogController");


// GET ALL BACKLOGS
router.get(
    "/",
    getBacklogs
);


// REPAIR SUBJECT ID
router.patch(
    "/:id/repair-subject",
    repairBacklogSubject
);


// CLEAR BACKLOG
router.patch(
    "/:id/clear",
    clearBacklog
);


// GET BACKLOG BY ID
router.get(
    "/:id",
    getBacklogById
);


module.exports = router;