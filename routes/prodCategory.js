const express = require("express");
const router = express.Router();

const { createCategory, updateCategory, deleteCategory, deleteBulkCategory,getCategory, getallCategory } = require("../controllers/prodCategoryCtrl");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.post("/createCategory",  createCategory);

router.put("/updateCategory/:id",  updateCategory);

router.delete("/deleteCategory/:id",  deleteCategory);

router.post("/deleteBulkCategory",  deleteBulkCategory);

router.post("/getCategory", getCategory);

router.get("/getallCategory", getallCategory);

module.exports = router;
