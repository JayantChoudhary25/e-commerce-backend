const express = require('express');
const router = express.Router();

const { createProduct, updateProduct, deleteProduct, getAllProduct, getaProduct, rating, addToWishlist} = require("../controllers/prodCtrl");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
// isAuthenticatedUser, authorizeRoles("admin"),
router.route("/createProduct").post( createProduct);
router.route("/updateProduct/:id").put( updateProduct);
router.route("/deleteProduct/:id").delete( deleteProduct);

router.route("/getaProduct/:id").get(getaProduct);
router.route("/getAllProduct").get(getAllProduct);
router.route("/rating").post(isAuthenticatedUser, rating);
// router.route("/addToWishlist").post(isAuthenticatedUser, addToWishlist);

router.route("/addToWishlist").post(addToWishlist);

module.exports = router;