// Create Token and saving in cookie

const sendToken = (user, statusCode, res) => {
  const token = user.getSignedToken();

  // options for cookie
  const options = {
    // expire: new Date(Date.now + 24 * 60 * 60 * 1000),
    maxAge: 72 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    token,
  });
};

module.exports = sendToken;
