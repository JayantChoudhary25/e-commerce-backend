const express = require("express");
const router = express.Router();

const { createBrand, updateBrand, deleteBrand, deleteBulkBrands, getBrand, getallBrand} = require("../controllers/brandCtrl");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

// router.post("/createCategory", isAuthenticatedUser, authorizeRoles("admin"), createCategory);

// router.put("/updateCategory/:id", isAuthenticatedUser, authorizeRoles("admin"), updateCategory);

// router.delete("/deleteCategory/:id", isAuthenticatedUser, authorizeRoles("admin"), deleteCategory);

router.post("/createBrand", createBrand);

router.put("/updateBrand/:id",  updateBrand);

router.delete("/deleteBrand/:id",  deleteBrand);

router.post("/deleteBulkBrands",  deleteBulkBrands);

router.get("/getBrand/:id", getBrand);

router.get("/getallBrand", isAuthenticatedUser, getallBrand);

module.exports = router;
