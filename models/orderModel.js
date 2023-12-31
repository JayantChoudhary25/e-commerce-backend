const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        count: Number,
        color: String,
      },
    ],
    paymentIntent: {},
    orderStatus: {
      type: String,
      default: "Not Processed",
      enum: [
        "Not Processed",
        "Cash on Delivery",
        "Payment Confirmed",
        "Processing",
        "Dispatched",
        "Cancelled",
        "Delivered",
      ],
    },
    expectedDelivery:{
      type: String,
      default: "6 Days"
    },
    orderby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);


const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
