const express = require("express");
const router = express.Router();

const { createCategory, updateCategory, deleteCategory, getCategory, getallCategory } = require("../controllers/prodCategoryCtrl");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

// router.post("/createCategory", isAuthenticatedUser, authorizeRoles("admin"), createCategory);

// router.put("/updateCategory/:id", isAuthenticatedUser, authorizeRoles("admin"), updateCategory);

// router.delete("/deleteCategory/:id", isAuthenticatedUser, authorizeRoles("admin"), deleteCategory);

router.post("/createCategory",  createCategory);

router.put("/updateCategory/:id",  updateCategory);

router.delete("/deleteCategory/:id",  deleteCategory);

router.get("/getCategory/:id", getCategory);

router.get("/getallCategory", getallCategory);

module.exports = router;
