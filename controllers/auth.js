const User = require("../models/User");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const ErrorResponse = require("../utils/errorRes");
const sendEmail = require("../utils/sendEmail");
const validateMongoDbId = require("../utils/validateMongodbId");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { generateRefreshToken } = require("../config/refreshtoken");
const { generateToken } = require("../config/jwtToken");
const sendToken = require("../utils/jwtToken");

exports.register = async (req, res, next) => {
  const { email, mobile } = req.body;

  const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });

  if (existingUser) {
    return res
      .status(400)
      .json({ error: "User with this email or mobile number already exists." });
  }

  try {
    const newUser = await User.create(req.body);
    sendToken(newUser, 201, res);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse("Please provide Email and Password", 400));
  }

  try {
    const findUser = await User.findOne({ email }).select("+password");
    // const isPasswordMatch = await bcrypt.compare(password, findUser.password);

    if (findUser && (await findUser.matchPasswords(password))) {
      sendToken(findUser, 201, res);
    } else {
      return next(new ErrorResponse("Invalid Credentials", 401));
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.adminLogin = async (req, res, next) => {
  const { email, password } = req.body;
  
  try {
    const findAdmin = await User.findOne({ email }).select("+password");
    
    if (!findAdmin) {
      throw new Error("Admin not found");
    }

    if (findAdmin.role !== "admin") {
      throw new Error("Not Authorized");
    }

    if (await findAdmin.matchPasswords(password)) {
      // const refreshToken = await generateRefreshToken(findAdmin?._id);
      // const updateuser = await User.findByIdAndUpdate(
      //   findAdmin.id,
      //   {
      //     refreshToken: refreshToken,
      //   },
      //   { new: true }
      // );

      // res.cookie("token", generateToken(findAdmin?._id), {
      //   httpOnly: true,
      //   maxAge: 72 * 60 * 60 * 1000,
      //   secure: true,
      // });
      sendToken(findAdmin, 201, res);
      // res.json({
      //   _id: findAdmin?._id,
      //   firstname: findAdmin?.firstname,
      //   lastname: findAdmin?.lastname,
      //   email: findAdmin?.email,
      //   mobile: findAdmin?.mobile,
      //   token: generateToken(findAdmin?._id),
      // });
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message,
    });
  }
};

exports.logout = async (req, res) => {
  // Clear the token cookie
  res.clearCookie('token');

  // Send a response indicating successful logout
  res.status(200).json({ success: true, message: 'Logout successful' });
};

exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorResponse("Email could not be sent", 404));
    }
    const resetToken = user.getResetPasswordToken();
    await user.save();

    const resetUrl = `http://localhost:3000/passwordreset/${resetToken}`;

    const message = `
      <h1>You have requested a Password RESET</h1>
      <p>Please click on this link to RESET your Password</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
    `;
    try {
      await sendEmail({
        to: user.email,
        subject: "PASSWORD RESET",
        text: message,
      });
      res.status(200).json({
        success: true,
        data: "EMAIL SENT",
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();

      return next(new ErrorResponse("Email could not be sent", 500));
    }
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      return next(new ErrorResponse("Invalid Reset Token", 400));
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    res.status(201).json({
      success: true,
      data: "Password Reset Successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.handleRefreshToken = async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error(" No Refresh token present in db or not matched");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("There is something wrong with refresh token");
    }
    const accessToken = generateToken(user?._id);
    res.json({ accessToken });
  });
};

exports.updatedUser = async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        firstname: req?.body?.firstname,
        lastname: req?.body?.lastname,
        email: req?.body?.email,
        mobile: req?.body?.mobile,
        dob: req?.body?.dob,
        country: req?.body?.country,
        language: req?.body?.language,
        about: req?.body?.about
      },
      {
        new: true,
      }
    );
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
};

// save user Address
exports.saveAddress = async (req, res, next) => {
  const { _id } = req.user._id;
  validateMongoDbId(_id);

  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        address: req?.body?.address,
      },
      {
        new: true,
      }
    );
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
};

exports.getallUser = async (req, res) => {
  try {
    const searchQuery = req.query.search;

    const userQuery = User.find();

    if (searchQuery) {
      userQuery.or([
        { firstname: { $regex: new RegExp(searchQuery, "i") } },
        { lastname: { $regex: new RegExp(searchQuery, "i") } },
        { email: { $regex: new RegExp(searchQuery, "i") } },
        { mobile: { $regex: new RegExp(searchQuery, "i") } },
      ]);
    }

    const users = await userQuery.populate("wishlist").exec();
    res.json(users);
  } catch (error) {
    throw new Error(error);
  }
};

exports.getaUser = async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    const getaUser = await User.findById(_id);
    res.json({
      getaUser,
    });
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteaUser = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const deleteaUser = await User.findByIdAndDelete(id);
    res.json({
      deleteaUser,
    });
  } catch (error) {
    throw new Error(error);
  }
};


// const blockUser = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   validateMongoDbId(id);

//   try {
//     const blockusr = await User.findByIdAndUpdate(
//       id,
//       {
//         isBlocked: true,
//       },
//       {
//         new: true,
//       }
//     );
//     res.json(blockusr);
//   } catch (error) {
//     throw new Error(error);
//   }
// });

// const unblockUser = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   validateMongoDbId(id);

//   try {
//     const unblock = await User.findByIdAndUpdate(
//       id,
//       {
//         isBlocked: false,
//       },
//       {
//         new: true,
//       }
//     );
//     res.json({
//       message: "User UnBlocked",
//     });
//   } catch (error) {
//     throw new Error(error);
//   }
// });


// const forgotPasswordToken = async (req, res) => {
//   const { email } = req.body;
//   const user = await User.findOne({ email });
//   if (!user) throw new Error("User not found with this email");
//   try {
//     const token = await user.createPasswordResetToken();
//     await user.save();
//     const resetURL = `Hi, Please follow this link to reset Your Password. This link is valid till 10 minutes from now. <a href='http://localhost:5000/api/user/reset-password/${token}'>Click Here</>`;
//     const data = {
//       to: email,
//       text: "Hey User",
//       subject: "Forgot Password Link",
//       htm: resetURL,
//     };
//     sendEmail(data);
//     res.json(token);
//   } catch (error) {
//     throw new Error(error);
//   }
// };

// exports.resetPassword = async (req, res) => {
//   const { password } = req.body;
//   const { token } = req.params;
//   const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
//   const user = await User.findOne({
//     passwordResetToken: hashedToken,
//     passwordResetExpires: { $gt: Date.now() },
//   });
//   if (!user) throw new Error(" Token Expired, Please try again later");
//   user.password = password;
//   user.passwordResetToken = undefined;
//   user.passwordResetExpires = undefined;
//   await user.save();
//   res.json(user);
// };


exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { _id } = req.user._id;

    const user = await User.findById(_id).select("+password");
    // Verify the current password
    const isPasswordMatch = await user.matchPasswords(currentPassword);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Password change failed" });
  }
};

// Get Wishlist
exports.getWishlist = async (req, res) => {
  const { _id } = req.user;

  try {
    const findUser = await User.findOne({ _id }).populate("wishlist");
    if (!findUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(findUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the wishlist.' });
  }
};

// Add to CART
exports.userCart = async (req, res) => {
  const { cart } = req.body;
  const { _id } = req.user;

  try {
    const user = await User.findById(_id);

    // Fetch the user's existing cart or create a new one if it doesn't exist
    let existingCart = user.cart;

    for (let i = 0; i < cart.length; i++) {
      let product = cart[i];
      let existingProductIndex = -1;

      // Check if the same product already exists in the cart
      for (let j = 0; j < existingCart.length; j++) {
        if (existingCart[j].product.toString() === product._id.toString()) {
          existingProductIndex = j;
          break;
        }
      }

      if (existingProductIndex !== -1) {
        // If the product exists, increase the count
        existingCart[existingProductIndex].count += product.count;
      } else {
        // If the product doesn't exist, add it to the cart
        let getPrice = await Product.findById(product._id).select("price").exec();

        existingCart.push({
          product: product._id,
          count: product.count,
          color: product.color,
          price: getPrice.price,
        });
      }
    }

    // Calculate the cart total
    let cartTotal = existingCart.reduce((total, product) => {
      return total + product.price * product.count;
    }, 0);

    user.cart = existingCart;
    user.cartTotal = cartTotal;

    // Save the user document with the updated cart
    await user.save();

    // Save the cart data in a separate Cart document
    let cartDocument = await Cart.findOne({ orderby: user._id });

    if (cartDocument) {
      // If a Cart document exists for this user, update it
      cartDocument.products = existingCart;
      cartDocument.cartTotal = cartTotal;
    } else {
      // If no Cart document exists, create a new one
      cartDocument = new Cart({ orderby: user._id, products: existingCart, cartTotal });
    }

    await cartDocument.save();

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while updating the cart.' });
  }
};

// Add to Cart without login
exports.addToCart = async (req, res) => {
  var { productId, count, color } = req.body;

  try {
    // Fetch the product details
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Retrieve the temporary cart from the session or a temporary identifier
    let tempCart = req.session.tempCart || req.cookies.tempCart;

    // If a temporary cart does not exist, create a new one
    if (!tempCart) {
      const newCart = new Cart({ products: [] });
      await newCart.save();
      req.session.tempCart = newCart._id;
      res.cookie("tempCart", newCart._id, {
        maxAge: 604800000, // Set the cookie expiration time (7 days)
      });
      tempCart = newCart; // Update tempCart to reference the new cart
    }

    // Check if the product is already in the cart
    const existingProduct = tempCart.products.find(
      (item) => item.product.toString() === productId
    );

    if (existingProduct) {
      // If the product is in the cart, update the quantity
      existingProduct.count += count;
    } else {
      // If the product is not in the cart, add it
      tempCart.products.push({
        product: productId,
        count,
        color,
        price: product.price,
      });
    }

    // Calculate the cart total
    tempCart.cartTotal = tempCart.products.reduce(
      (total, item) => total + item.price * item.count,
      0
    );

    await tempCart.save();

    res.json(tempCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding to the cart" });
  }
};

// Get Cart 
exports.getUserCart = async (req, res) => {
  const userId = req.user._id;
  validateMongoDbId(userId);
  try {
    const cart = await Cart.findOne({ orderby: userId }).populate(
      "products.product"
    );
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found for this user' });
    }
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Empty Whole Cart
exports.emptyCart = async (req, res) => {
  const { _id } = req.user._id;
  validateMongoDbId(_id);
  try {
    const user = await User.findOne({ _id });
    const cart = await Cart.findOneAndRemove({ orderby: user._id });
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
};

// Remove a single quantity of a product from the user's cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const productId = req.body.productId;

    // Find the user and their cart
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the index of the product to be removed in the user's cart
    const productIndex = user.cart.findIndex((item) => item.product.toString() === productId);

    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found in the cart' });
    }

    // Remove the product from the user's cart
    user.cart.splice(productIndex, 1);

    // Calculate the cart total
    const cartTotal = user.cart.reduce((total, product) => {
      return total + product.price * product.count;
    }, 0);

    user.cartTotal = cartTotal;

    // Save the user document
    await user.save();

    // Remove the product from the Cart document
    const cartDocument = await Cart.findOne({ orderby: userId });

    if (cartDocument) {
      const cartProductIndex = cartDocument.products.findIndex((item) => item.product.toString() === productId);
      if (cartProductIndex !== -1) {
        cartDocument.products.splice(cartProductIndex, 1);
        await cartDocument.save();
      }
    }

    res.json(user.cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while removing the product from the cart' });
  }
};

// exports.applyCoupon = async (req, res) => {
//   const { coupon } = req.body;
//   const { _id } = req.user;
//   validateMongoDbId(_id);
//   const validCoupon = await Coupon.findOne({ name: coupon });
//   if (validCoupon === null) {
//     throw new Error("Invalid Coupon");
//   }
//   const user = await User.findOne({ _id });
//   let { cartTotal } = await Cart.findOne({
//     orderby: user._id,
//   }).populate("products.product");
//   let totalAfterDiscount = (
//     cartTotal -
//     (cartTotal * validCoupon.discount) / 100
//   ).toFixed(2);
//   await Cart.findOneAndUpdate(
//     { orderby: user._id },
//     { totalAfterDiscount },
//     { new: true }
//   );
//   res.json(totalAfterDiscount);
// };

exports.createOrder = async (req, res) => {
  const { COD, couponApplied } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    if (!COD) throw new Error("Create cash order failed");
    const user = await User.findById(_id);
    let userCart = await Cart.findOne({ orderby: user._id });
    let finalAmout = 0;
    if (couponApplied && userCart.totalAfterDiscount) {
      finalAmout = userCart.totalAfterDiscount;
    } else {
      finalAmout = userCart.cartTotal;
    }

    let newOrder = await new Order({
      products: userCart.products,
      paymentIntent: {
        id: uniqid(),
        method: "COD",
        amount: finalAmout,
        status: "Cash on Delivery",
        created: Date.now(),
        currency: "usd",
      },
      orderby: user._id,
      orderStatus: "Cash on Delivery",
    }).save();
    let update = userCart.products.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product._id },
          update: { $inc: { quantity: -item.count, sold: +item.count } },
        },
      };
    });
    const updated = await Product.bulkWrite(update, {});
    res.json({ message: "success" });
  } catch (error) {
    throw new Error(error);
  }
};

exports.getOrders = async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const userorders = await Order.findOne({ orderby: _id })
      .populate("products.product")
      .populate("orderby")
      .exec();
    res.json(userorders);
  } catch (error) {
    throw new Error(error);
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const alluserorders = await Order.find()
      .populate("products.product")
      .populate("orderby")
      .exec();
    res.json(alluserorders);
  } catch (error) {
    throw new Error(error);
  }
};

exports.getOrderByUserId = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const userorders = await Order.findOne({ orderby: id })
      .populate("products.product")
      .populate("orderby")
      .exec();
    res.json(userorders);
  } catch (error) {
    throw new Error(error);
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateOrderStatus = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus: status,
        paymentIntent: {
          status: status,
        },
      },
      { new: true }
    );
    res.json(updateOrderStatus);
  } catch (error) {
    throw new Error(error);
  }
};