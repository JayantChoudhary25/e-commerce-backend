const express = require('express');
const router = express.Router();
const upload = require("../utils/uploadImage"); // Import the upload middleware
const {
  register,
  login,
  adminLogin,
  logout,
  forgotPassword,
  resetPassword,
//   handleRefreshToken,
  getallUser,
  getaUser,
  getUserById,
  deleteaUser,
  updatedUser,
//   blockUser,
//   unblockUser,
  updatePassword,
//   forgotPasswordToken,
  getWishlist,
  saveAddress,
  userCart,
  getUserCart,
  emptyCart,
  removeFromCart,
  addToCart,
  toCart,
  getCart,
//   applyCoupon,
  createOrder,
  getOrders,
  updateOrderStatus,
  getAllOrders,
} = require("../controllers/auth");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.route("/login").post(login);

router.route("/adminLogin").post(adminLogin);

router.route("/logout").get(logout);

// Create User
router.route("/register").post(register);

// Update User Password
router.post("/updatePassword", isAuthenticatedUser, updatePassword);

// Update User
router.put("/edit-user", isAuthenticatedUser, updatedUser);

// Get all Users
router.get("/all-users",  getallUser);

// Get a User
router.route("/getaUser").get(isAuthenticatedUser, getaUser);

// Get user by ID 
router.route("/getUserById").post(isAuthenticatedUser, getUserById);

// Delete a user
router.delete("/deleteaUser/:id", deleteaUser);

// Update Address
router.put("/save-address", isAuthenticatedUser, saveAddress);

router.route("/forgotpassword").post(forgotPassword);
router.route("/resetpassword/:resetToken").put(resetPassword);

// Add to CART
router.post("/cart", isAuthenticatedUser, userCart);

// Add to CART without login
router.post("/addToCart", addToCart);

// Add to Cart without login
router.post("/toCart", toCart);

// Get cart without login with session storage
router.get("/getCart", getCart)

// Get User Cart 
router.get("/getUserCart", isAuthenticatedUser, getUserCart);

// Empty Whole Cart
router.delete("/empty-cart",isAuthenticatedUser, emptyCart);

// Remove a single quantity of a product from the user's cart
router.post("/remove-cart", isAuthenticatedUser ,removeFromCart);


// Get Wishlist
router.get("/wishlist", isAuthenticatedUser, getWishlist);


router.post("/cart/cash-order", isAuthenticatedUser, createOrder);

router.get("/get-orders", isAuthenticatedUser, getOrders);

// router.get("/getallorders", isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);

// router.post("/getorderbyuser/:id", isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);

//router.put( "/order/update-order/:id", isAuthenticatedUser, authorizeRoles("admin"), updateOrderStatus );

// router.put("/block-user/:id", isAuthenticatedUser, authorizeRoles("admin"), blockUser);

// router.put("/unblock-user/:id", isAuthenticatedUser, authorizeRoles("admin"), unblockUser);

// Uploading images
router.post("/upload", upload.array("images", 5), (req, res) => {

  // Check if files were uploaded successfully
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded." });
  }

  // Get the uploaded image URLs from Cloudinary
  const imageUrls = req.files.map((file) => file.path);

  // You can save these image URLs to your product model or perform other actions as needed

  res.status(200).json({ imageUrls });
});

module.exports = router;