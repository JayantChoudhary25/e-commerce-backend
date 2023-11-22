const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorRes");

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new ErrorResponse("Not Authorized to ACCESS this Route", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ErrorResponse("No user found with this ID", 404));
    }
    req.user = user;

    next();
  } catch (error) {
    return next(new ErrorResponse("Not Authorized to ACCESS this route", 401));
  }
};

exports.isAuthenticatedUser = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return next(new ErrorResponse("Please Login to access this resource", 401));
  }

  // Extract the token from the Authorization header
  const token = authorizationHeader;

  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decodedData.id);

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    req.user = user;
    
    next();
  } catch (error) {
    console.log("Error:",error);
    return next(new ErrorResponse("Token is invalid", 401));
  }
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `Role: ${req.user.role} is not allowed to access this resouce `,
          403
        )
      );
    }

    next();
  };
};
