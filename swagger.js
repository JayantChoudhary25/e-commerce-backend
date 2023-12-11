const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "My API",
    description: "E-com",
  },
  host: "localhost:4000",
};

const outputFile = "./swagger-output.json";
const routes = [
  "./routes/auth.js",
  "./routes/product.js",
  "./routes/sizeChart",
  "./routes/prodCategory",
  "./routes/subCategory",
  "./routes/brand",
  "./routes/color",
  "./routes/vendor",
  "./routes/currency"
];

swaggerAutogen(outputFile, routes, doc);
