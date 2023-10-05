const express = require('express');
const router = express.Router();

const { register, login, adminLogin, logout, forgotPassword, resetPassword, handleRefreshToken } = require("../controllers/auth");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.route("/register").post(register);

router.route("/login").post(login);

router.route("/adminLogin").post(adminLogin);

router.route("/logout").get(logout);

router.get("/refresh", handleRefreshToken);

router.route("/forgotpassword").post(forgotPassword);

router.route("/resetpassword/:resetToken").put(resetPassword);

module.exports = router;