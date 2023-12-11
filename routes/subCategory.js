const express = require("express");
const router = express.Router();

const { createSubCategory, updateSubCategory, deleteSubCategory, deleteBulkSubCategory,getSubCategory, getallSubCategory } = require("../controllers/subCategoryCtrl");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.post("/createSubCategory",isAuthenticatedUser, authorizeRoles("admin"),  createSubCategory);

router.put("/updateSubCategory/:id",isAuthenticatedUser, authorizeRoles("admin"),  updateSubCategory);

router.delete("/deleteSubCategory/:id",isAuthenticatedUser, authorizeRoles("admin"),  deleteSubCategory);

router.post("/deleteBulkSubCategory", isAuthenticatedUser, authorizeRoles("admin"), deleteBulkSubCategory);

router.post("/getSubCategory", getSubCategory);

router.get("/getallSubCategory", getallSubCategory);

module.exports = router;
