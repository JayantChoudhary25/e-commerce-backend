const express = require("express");
const router = express.Router();

const { createColor, updateColor, deleteColor, getColors, getaColor} = require("../controllers/colorCtrl");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.post("/createColor", createColor);

router.put("/updateColor",  updateColor);

router.delete("/deleteColor",  deleteColor);

router.get("/getColors", getColors);

router.post("/getaColor", getaColor);

module.exports = router;
