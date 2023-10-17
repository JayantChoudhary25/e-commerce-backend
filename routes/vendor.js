const express = require("express");
const router = express.Router();

const { createVendor, updateVendor, deleteVendor, getAllVendors} = require("../controllers/vendorCtrl");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

// router.post("/createCategory", isAuthenticatedUser, authorizeRoles("admin"), createCategory);

// router.put("/updateCategory/:id", isAuthenticatedUser, authorizeRoles("admin"), updateCategory);

// router.delete("/deleteCategory/:id", isAuthenticatedUser, authorizeRoles("admin"), deleteCategory);

router.post("/createVendor",  createVendor);

router.put("/updateVendor/:id",  updateVendor);

router.delete("/deleteVendor/:id",  deleteVendor);

// router.get("/getBrand/:id", getBrand);

router.get("/getAllVendors", getAllVendors);

module.exports = router;
