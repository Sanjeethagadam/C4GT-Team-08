const express = require("express");
const router = express.Router();

const {
    getSupplyApplications,
    createSupplyApplication
} = require("../controllers/supplyApplicationController");

router.get("/", getSupplyApplications);
router.post("/", createSupplyApplication);

module.exports = router;