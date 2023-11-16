const express = require("express");
const router = express.Router();

const { createBrand, updateBrand, deleteBrand, deleteBulkBrands, getBrand, getallBrand} = require("../controllers/brandCtrl");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.post("/createBrand", createBrand);

router.put("/updateBrand/:id",  updateBrand);

router.delete("/deleteBrand/:id",  deleteBrand);

router.post("/deleteBulkBrands",  deleteBulkBrands);

router.post("/getBrand", getBrand);

router.get("/getallBrand", getallBrand);

module.exports = router;
