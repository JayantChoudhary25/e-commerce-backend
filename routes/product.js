const express = require('express');
const router = express.Router();

const { createProduct, updateProduct, deleteProduct, getAllProduct, getaProduct, rating} = require("../controllers/prodCtrl");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.route("/createProduct").post(isAuthenticatedUser, authorizeRoles("admin"), createProduct);
router.route("/updateProduct").put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct);
router.route("/deleteProduct").delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);

router.route("/getaProduct").get(getaProduct);
router.route("/getAllProduct").get(getAllProduct);
router.route("/rating").post(isAuthenticatedUser, rating);

module.exports = router;