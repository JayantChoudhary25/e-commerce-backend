const express = require('express');
const router = express.Router();

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
//   applyCoupon,
  // createOrder,
  // getOrders,
  updateOrderStatus,
  //getAllOrders,
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

// Delete a user
router.delete("/deleteaUser/:id", deleteaUser);

// Update Address
router.put("/save-address", isAuthenticatedUser, saveAddress);

router.route("/forgotpassword").post(forgotPassword);
router.route("/resetpassword/:resetToken").put(resetPassword);

// Add to CART
router.post("/cart", isAuthenticatedUser, userCart);

// Get User Cart 
router.get("/getUserCart", isAuthenticatedUser, getUserCart);

// Empty Whole Cart
router.delete("/empty-cart", emptyCart);

// Remove a single quantity of a product from the user's cart
router.post("/remove-cart", removeFromCart);


// Get Wishlist
router.get("/wishlist", isAuthenticatedUser, getWishlist);


// router.post("/cart/cash-order", isAuthenticatedUser, createOrder);

// router.get("/get-orders", isAuthenticatedUser, getOrders);

// router.get("/getallorders", isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);

// router.post("/getorderbyuser/:id", isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);

//router.put( "/order/update-order/:id", isAuthenticatedUser, authorizeRoles("admin"), updateOrderStatus );

// router.put("/block-user/:id", isAuthenticatedUser, authorizeRoles("admin"), blockUser);

// router.put("/unblock-user/:id", isAuthenticatedUser, authorizeRoles("admin"), unblockUser);

module.exports = router;