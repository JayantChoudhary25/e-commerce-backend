const express = require('express');
const router = express.Router();

const { createProduct, updateProduct, deleteProduct, deleteBulkProducts, getAllProduct, getProductsByVendor,updateProductVendor,getaProduct, rating, addToWishlist, deleteAllWishlistItems} = require("../controllers/prodCtrl");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
// isAuthenticatedUser, authorizeRoles("admin"),

router.route("/createProduct").post( createProduct);
router.route("/updateProduct/:id").put( updateProduct);
router.route("/deleteProduct/:id").delete( deleteProduct);
router.route("/deleteBulkProducts").post( deleteBulkProducts);

router.route("/getaProduct/:id").get(getaProduct);
router.route("/getAllProduct").get(getAllProduct);
router.route("/getProductsByVendor/:vendorId").get(getProductsByVendor);

router.route("/updateProductVendor/:productId").post(updateProductVendor)

router.route("/rating").post(isAuthenticatedUser, rating);

// Add to Wishlist
router.route("/addToWishlist").post( isAuthenticatedUser, addToWishlist);

// Add to Wishlist
router.route("/deleteAllWishlistItems").delete( isAuthenticatedUser, deleteAllWishlistItems);

module.exports = router;