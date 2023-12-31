const User = require("../models/User");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const ErrorResponse = require("../utils/errorRes");
const sendEmail = require("../utils/sendEmail");
const validateMongoDbId = require("../utils/validateMongodbId");
const crypto = require("crypto");
// const bcrypt = require("bcryptjs");
const uniqid = require('uniqid');
// const { generateRefreshToken } = require("../config/refreshtoken");
const { generateToken } = require("../config/jwtToken");
const sendToken = require("../utils/jwtToken");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


exports.register = async (req, res, next) => {
  const { email, mobile } = req.body;

  const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });

  if (existingUser) {
    return res
      .status(203)
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
      return res.status(401).json(`${email} this email is not registered`);
    }
    const resetToken = user.getResetPasswordToken();
    await user.save();

    const resetUrl = `https://nextjs-app-wheat-three.vercel.app/user-password-reset/${resetToken}`;

    const message = `
    <!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
        }
        .header {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 5px 5px 0 0;
        }
        .content {
            padding: 20px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white !important;
            text-decoration: none;
            border-radius: 5px;
        }
        .footer {
            background-color: #f5f5f5;
            padding: 10px;
            border-top: 1px solid #e0e0e0;
            border-radius: 0 0 5px 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Hello ${user.firstname},</h2>
        </div>
        <div class="content">
            <p>We have received a request to reset your password for your account on <strong>E-Commerce</strong>. If you did not request this change, you can ignore this email and your password will not be changed.</p>
            
            <p>To reset your password, please click on the following link and follow the instructions:</p>
            
            <p><a class="button" href="${resetUrl}">Reset Password</a></p>
            
            <p>This link will expire in <strong>15 minutes</strong> for security reasons. If you need to reset your password after this time, please make another request.</p>
        </div>
        <div class="footer">
            <h3>Thank you,</h3>
            <h3>E-Commerce Team</h3>
        </div>
    </div>
</body>
</html>
    `;
    try {
      await sendEmail({
        to: user.email,
        subject: "Account Password Reset Link",
        text: message,
      });
      res.status(200).json({
        success: true,
        data: "Password Reset Email Sent Successfully",
      });
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;

      await user.save();

      return res.status(500).json("Email could not be sent");
    }
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({
      passwordResetToken: req.params.resetToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    
    if (!user) {
      return next(new ErrorResponse("Invalid Reset Token", 400));
    }
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

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
  const { _id } = req.user._id;
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
        about: req?.body?.about,
        address: req?.body?.address
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

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    userQuery.skip(skip).limit(limit);

    const users = await userQuery.populate("wishlist").exec();

    // Count total items
    const totalItems = await User.countDocuments();

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / limit);

    // Check if requested page exists
    if (page > totalPages) {
      throw new Error("This Page does not exist");
    }

    res.json({
      totalItems,
      totalPages,
      currentPage: page,
      users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
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

exports.getUserById = async (req, res) => {
  const { _id } = req.body;
  validateMongoDbId(_id);

  try {
    const user = await User.findById(_id);
    res.status(200).json({
      user,
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
      return res.status(203).json({ message: "Current password is incorrect" });
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

      // Check if the same product with the same color already exists in the cart
      for (let j = 0; j < existingCart.length; j++) {
        if (
          existingCart[j].product.toString() === product._id.toString() &&
          existingCart[j].color === product.color
        ) {
          existingProductIndex = j;
          break;
        }
      }

      if (existingProductIndex !== -1) {
        // If the product exists, increase the count
        existingCart[existingProductIndex].count += product.count;
      } else {
        // If the product doesn't exist, add it to the cart
        let getPrice = await Product.findById(product._id).select("discountedPrice").exec();

        existingCart.push({
          product: product._id,
          count: product.count,
          color: product.color,
          price: getPrice ? getPrice.discountedPrice : 0,
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

// Increase or decrease count of a product in the cart
exports.increaseProductCount = async (req, res) => {
  const { productId, action, color } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    let existingCart = user.cart;

    // Find the index of the product in the cart
    const existingProductIndex = existingCart.findIndex(
      (item) =>
        item.product.toString() === productId.toString() && item.color === color
    );

    if (existingProductIndex !== -1) {
      // Fetch the product details for the order
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found.' });
      }

      // Calculate the price based on discountedPrice
      const price = product.discountedPrice || 0;

      // Update the count based on the action
      if (action === 'increase') {
        // Check if increasing the count exceeds the available quantity
        const availableQuantity = product.quantity || 0;
        if (existingCart[existingProductIndex].count + 1 > availableQuantity) {
          return res.status(403).json({ error: 'Stock is limited. Cannot increase quantity beyond available stock.' });
        }
        
        existingCart[existingProductIndex].count += 1;
      } else if (action === 'decrease') {
        if (existingCart[existingProductIndex].count > 1) {
          existingCart[existingProductIndex].count -= 1;
        } else {
          // If count is already 1 and the user tries to decrease, you may want to keep the count as 1
          // Alternatively, you can remove the product from the cart
          // existingCart.splice(existingProductIndex, 1);
        }
      } else {
        return res.status(400).json({ error: 'Invalid action. Use "increase" or "decrease".' });
      }

      // Update cart total
      let cartTotal = existingCart.reduce((total, product) => {
        return total + product.price * product.count;
      }, 0);

      user.cart = existingCart;
      user.cartTotal = cartTotal;

      // Save the user document with the updated cart
      await user.save();

      // Update the Cart document if it exists
      let cartDocument = await Cart.findOne({ orderby: userId });

      if (cartDocument) {
        cartDocument.products = existingCart;
        cartDocument.cartTotal = cartTotal;
        await cartDocument.save();
      }

      res.json(user);
    } else {
      // If the product with the specified color doesn't exist, add it to the cart
      let product = await Product.findById(productId).select("discountedPrice quantity").exec();

      // Check if adding a new product exceeds the available quantity
      if (product && product.quantity && product.quantity <= 0) {
        return res.status(403).json({ error: 'Stock is limited. Cannot add product to the cart as it is out of stock.' });
      }

      existingCart.push({
        product: productId,
        count: 1, // Assuming a new product is added with a count of 1
        color: color,
        price: product ? product.discountedPrice : 0,
      });

      // Update cart total
      let cartTotal = existingCart.reduce((total, product) => {
        return total + product.price * product.count;
      }, 0);

      user.cart = existingCart;
      user.cartTotal = cartTotal;

      // Save the user document with the updated cart
      await user.save();

      // Update the Cart document if it exists
      let cartDocument = await Cart.findOne({ orderby: userId });

      if (cartDocument) {
        cartDocument.products = existingCart;
        cartDocument.cartTotal = cartTotal;
        await cartDocument.save();
      }

      res.json(user);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while updating the cart.' });
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
      return res.status(202).json({ message: "Cart not found for this user" });
    }
    res.status(200).json({ message: "Cart retrieved successfully.", cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Empty Whole Cart
exports.emptyCart = async (req, res) => {
  const userId = req.user._id;
  validateMongoDbId(userId);

  try {
    // Find the user
    const user = await User.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Clear the user's cart
    user.cart = [];
    user.cartTotal = 0;

    // Save the user document with the empty cart
    await user.save();

    // Remove the entire cart from the Cart document
    const cart = await Cart.findOneAndRemove({ orderby: userId });

    res.json({ message: 'Cart emptied successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
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

    // Get the price of the product being removed
    const removedProduct = user.cart[productIndex];
    const removedProductPrice = removedProduct.price * removedProduct.count;

    // Remove the product from the user's cart
    user.cart.splice(productIndex, 1);

    // Calculate the cart total
    const cartTotal = user.cart.reduce((total, product) => {
      return total + product.price * product.count;
    }, 0);

    // Subtract the removed product price from the cart total
    user.cartTotal = cartTotal - removedProductPrice;

    // Save the user document
    await user.save();

    // Remove the product from the Cart document
    const cartDocument = await Cart.findOne({ orderby: userId });

    if (cartDocument) {
      const cartProductIndex = cartDocument.products.findIndex((item) => item.product.toString() === productId);
      if (cartProductIndex !== -1) {
        cartDocument.products.splice(cartProductIndex, 1);

        // Update the cart total in the Cart document
        cartDocument.cartTotal = cartTotal;
        
        await cartDocument.save();
      }
    }

    res.json(user.cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while removing the product from the cart' });
  }
};

// ORDER 
exports.createOrderr = async (req, res) => {
  const { COD } = req.body;
  const { _id } = req.user._id;
  validateMongoDbId(_id);
  try {
    if (!COD) throw new Error("Create cash order failed");
    const user = await User.findById(_id);
    let userCart = await Cart.findOne({ orderby: user._id });
    let finalAmout = userCart.cartTotal; // Use cartTotal directly without checking for couponApplied

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

    // Save the order ID in the user's orders array
    user.orders.push(newOrder._id);
    
    // You might want to clear the user's cart after the order is created
    user.cart = [];
    user.cartTotal = 0;
    await user.save();

    // You might also want to clear the user's cart in the Cart document
    await Cart.findOneAndDelete({ orderby: user._id });

    res.json({ message: "success" });
  } catch (error) {
    console.log("Error:", error);
    throw new Error(error);
  }
};

exports.createOrder = async (req, res) => {
  const { COD } = req.body;
  const { _id } = req.user._id;

  validateMongoDbId(_id);

  const user = await User.findById(_id);
  const userCart = await Cart.findOne({ orderby: user._id }).populate('products.product');
  const finalAmount = userCart.cartTotal;

  const lineItems = userCart.products.map((product)=>({
    price_data:{
        currency:"inr",
        product_data:{
            name: product.product._id.toString(),
            // title: product.product.title,
        },
        unit_amount:product.price * 100,
    },
    quantity:product.count
}));

  try {
    if (!COD) {
      // Create a payment intent with Stripe
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: "payment",
        line_items: lineItems,
        currency: 'inr',
        metadata: { order_id: uniqid() },
        success_url: "https://nextjs-app-wheat-three.vercel.app/success",
        cancel_url: "https://nextjs-app-wheat-three.vercel.app/cancel"
      });

      const newOrder = await new Order({
        products: userCart.products,
        paymentIntent: {
          id: session.id,
          method: 'Stripe',
          amount: finalAmount,
          status: 'Payment Confirmed',
          created: Date.now(),
          currency: 'inr',
        },
        orderby: user._id,
        orderStatus: 'Payment Confirmed',
      }).save();

      // Update product quantities and sold counts
      const update = userCart.products.map((item) => {
        return {
          updateOne: {
            filter: { _id: item.product._id },
            update: { $inc: { quantity: -item.count, sold: +item.count } },
          },
        };
      });
      await Product.bulkWrite(update, {});

      // Save the order ID in the user's orders array
      user.orders.push(newOrder._id);

      // Clear the user's cart
      user.cart = [];
      user.cartTotal = 0;
      await user.save();

      // Clear the user's cart in the Cart document
      await Cart.findOneAndDelete({ orderby: user._id });

      res.json({ message: 'Payment successful', paymentIntentId: session.id , session });
    } else {
      // Handle Cash on Delivery logic here
      const newOrder = await new Order({
        products: userCart.products,
        paymentIntent: {
          id: uniqid(),
          method: 'COD',
          amount: finalAmount,
          status: 'Cash on Delivery',
          created: Date.now(),
          currency: 'usd',
        },
        orderby: user._id,
        orderStatus: 'Cash on Delivery',
      }).save();

      // Save the order ID in the user's orders array
      user.orders.push(newOrder._id);

      // Clear the user's cart
      user.cart = [];
      user.cartTotal = 0;
      await user.save();

      // Clear the user's cart in the Cart document
      await Cart.findOneAndDelete({ orderby: user._id });

      res.json({ message: 'success', paymentIntent: { method: 'COD', status: 'Cash on Delivery' } });
    }
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Payment failed' });
  }
};

exports.getOrders = async (req, res) => {
  const { _id } = req.user._id;
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
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orderQuery = Order.find()
      .populate("products.product")
      .populate("orderby")
      .skip(skip)
      .limit(limit)
      .exec();

    const alluserorders = await orderQuery;

    // Count total items
    const totalItems = await Order.countDocuments();

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / limit);

    // Check if requested page exists
    if (page > totalPages) {
      throw new Error("This Page does not exist");
    }

    res.json({
      totalItems,
      totalPages,
      currentPage: page,
      alluserorders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getOrderByUserId = async (req, res) => {
  const { id } = req.body;
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
  const { status , id } = req.body;
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
