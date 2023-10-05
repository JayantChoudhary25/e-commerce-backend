require("dotenv").config({ path: "./.env" });
const express = require("express");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const dotenv = require("dotenv");

// Connect Database
connectDB();

const app = express();

const corsOptions = {
  origin: ["http://localhost:3000", "https://e-commerce-backend-brown.vercel.app", "*"],
  credentials: true, // Enable credentials (cookies, HTTP authentication) in cross-origin requests
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(cookieParser('secret'));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));
// app.use(
//   session({
//     secret: process.env.SECRET_SESSION,
//     resave: true,
//     saveUninitialized: true,
//   })
// );

app.use("/api/auth", require("./routes/auth"));
app.use("/api/private", require("./routes/private"));
app.use("/api/product", require("./routes/product"));

// Error Handler 
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
// DB error handler
process.on("unhandledRejection", (err, promise) => {
  console.log(`Log Error: ${err}`);
  server.close(() => process.exit(1));
});
