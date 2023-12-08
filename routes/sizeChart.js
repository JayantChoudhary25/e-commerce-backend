const express = require("express");
const router = express.Router();

const { createSizeChart, updateSizeChart, deleteSizeChart, getSizeChart, getAllSizeCharts } = require("../controllers/sizeChartCtrl");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.post("/createSizeChart", isAuthenticatedUser, authorizeRoles("admin"), createSizeChart);

router.put("/updateSizeChart", isAuthenticatedUser, authorizeRoles("admin"), updateSizeChart);

router.delete("/deleteSizeChart", isAuthenticatedUser, authorizeRoles("admin"), deleteSizeChart);

router.get("/getSizeChart/:id", getSizeChart);

router.get("/getAllSizeCharts", getAllSizeCharts);

module.exports = router;
