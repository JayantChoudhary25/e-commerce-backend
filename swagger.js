const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info : {
        title : "My API",
        description: "E-com"
    },
    host: 'localhost:4000'
};

const outputFile = "./swagger-output.json";
const routes = ["./routes/auth.js", './routes/product.js'];

swaggerAutogen(outputFile , routes , doc);
