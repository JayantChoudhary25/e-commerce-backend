const express = require('express');
const router = express.Router();

const { createProduct, updateProduct, deleteProduct, getAllProduct, getaProduct, rating} = require("../controllers/prodCtrl");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.route("/createProduct").post(createProduct);
router.route("/updateProduct/:id").put(updateProduct);
router.route("/deleteProduct/:id").delete(deleteProduct);

router.route("/getaProduct/:id").get(getaProduct);
router.route("/getAllProduct").get(getAllProduct);
router.route("/rating").post(rating);

module.exports = router;