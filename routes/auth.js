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
  createOrder,
  getOrders,
  updateOrderStatus,
  getAllOrders,
} = require("../controllers/auth");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.route("/register").post(register);

router.route("/login").post(login);

router.route("/adminLogin").post(adminLogin);

router.route("/logout").get(logout);

router.post("/updatePassword", isAuthenticatedUser, updatePassword)

router.route("/forgotpassword").post(forgotPassword);

router.route("/resetpassword/:resetToken").put(resetPassword);

// Add to CART
router.post("/cart", isAuthenticatedUser, userCart);

router.post("/cart/cash-order", isAuthenticatedUser, createOrder);

router.get("/all-users", isAuthenticatedUser, authorizeRoles("admin"), getallUser);

router.route("/getaUser").get(isAuthenticatedUser, getaUser);

router.get("/get-orders", isAuthenticatedUser, getOrders);

router.get("/getallorders", isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);

router.post("/getorderbyuser/:id", isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);

// Get Wishlist
router.get("/wishlist", isAuthenticatedUser, getWishlist);

// Get User Cart 
router.get("/getUserCart", isAuthenticatedUser, getUserCart);

router.delete("/empty-cart", emptyCart);

router.post("/remove-cart", removeFromCart);

router.delete("/deleteaUser/:id", deleteaUser);

router.put( "/order/update-order/:id", isAuthenticatedUser, authorizeRoles("admin"), updateOrderStatus );

router.put("/edit-user", isAuthenticatedUser, updatedUser);

router.put("/save-address", saveAddress);



// router.put("/block-user/:id", isAuthenticatedUser, authorizeRoles("admin"), blockUser);

// router.put("/unblock-user/:id", isAuthenticatedUser, authorizeRoles("admin"), unblockUser);

module.exports = router;