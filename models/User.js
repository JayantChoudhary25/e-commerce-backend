const mongoose = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "Please Enter Firstname"],
    },
    lastname: {
      type: String,
      required: [true, "Please Enter Lastname"],
    },
    dob: {
      type: String,
    },
    country: {
      type: String,
    },
    language: {
      type: String,
    },
    about: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Please Enter Email Address"],
      unique: true,
    },
    mobile: {
      type: String,
      required: [true, "Please Enter Mobile No."],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please Enter Password"],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      default: "user",
    },
    cart: {
      type: Array,
      default: [],
    },
    address: {
      type: String,
    },
    shippingAddress: {
      type: String,
    },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    refreshToken: {
      type: String,
    },
    //temp
    // orders: [
    //   {
    //     product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    //     orderStatus: { type: String, default: "Pending" },
    //     paymentStatus: { type: String, default: "Pending" },
    //   },
    // ],
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPasswords = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.getSignedToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

    this.resetPasswordExpire = Date.now() +10 * (60 * 1000);
  return resetToken;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
