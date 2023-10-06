const ErrorResponse = require("../utils/errorRes");

// const errorHandler = (err, req, res, next) => {
//   let error = { ...err };

//   error.message = err.message;

//   // console.log(err);

//   if (error.code === 11000) {
//     const message = `Duplicate Filed Value Enter`;
//     error = new ErrorResponse(message, 400);
//   }

//   if (error.name === "ValidationError") {
//     const message = Object.values(err.errors).map((val) => val.message);
//     error = new ErrorResponse(message, 400);
//   }

//   res.status(error.statusCode || 500).json({
//     success: false,
//     error: error.message || "Server  Error !!!!!",
//   });
// };
// not Found

const notFound = (req, res, next) => {
  const error = new ErrorResponse(`Not Found : ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Error Handler

const errorHandler = (err, req, res, next) => {
  const statuscode = res.statusCode == 200 ? 500 : res.statusCode;
  res.status(statuscode);
  res.json({
    status: "fail",
    message: err?.message,
    stack: err?.stack,
  });
};

// module.exports = { errorHandler, notFound };


module.exports = errorHandler;
