require("dotenv").config({ path: "./.env" });
const express = require("express");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const dotenv = require("dotenv");
// const swaggerUi = require('swagger-ui-express');
// const swaggerDocument = require('./swagger-output.json');

// Connect Database
connectDB();

const app = express();

const corsOptions = {
  origin: [
  "http://localhost:3000", 
  "https://e-commerce-backend-brown.vercel.app", 
  "https://nextjs-app-wheat-three.vercel.app", 
  "*"
],
  credentials: true, 
};

app.use(cors(corsOptions));

app.use(express.json());
// app.use(cors({ origin: "*" }));
app.use(cookieParser('secret'));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));
app.use(
  session({
    secret: process.env.SECRET_SESSION,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  })
);

// Swagger GUI API 
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Backend API is Running Msg 
app.get("/", (req, res) => {
  res.send("API is running..");
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/private", require("./routes/private"));
app.use("/api/product", require("./routes/product"));
app.use("/api/chart", require("./routes/sizeChart"));
app.use("/api/category", require("./routes/prodCategory"));
app.use("/api/subCategory", require("./routes/subCategory"));
app.use("/api/brand", require("./routes/brand"));
app.use("/api/color", require("./routes/color"));
app.use("/api/vendor", require("./routes/vendor"));
app.use("/api/currency", require("./routes/currency"));
app.use("/api/auth/upload", require("./routes/auth"));

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
