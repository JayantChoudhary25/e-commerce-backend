const mongoose = require("mongoose"); 

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discountedPrice: {
      type: Number,
    },
    category: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    currencyName: {
      type: String
    },
    sold: {
      type: Number,
      default: 0,
    },
    images: [
      {
        public_id: String,
        url: Array,
        color: String
      },
    ],
    sizeChart: [
      {
        size: String, // e.g., 'S', 'M', 'L', etc.
        measurements: {
          chest: {
            unit: String, // e.g., 'inches', 'centimeters', etc.
            value: Number,
          },
          waist: {
            unit: String,
            value: Number,
          },
          hips: {
            unit: String,
            value: Number,
          },
          length: {
            unit: String,
            value: Number,
          },
          sleeveLength: {
            unit: String,
            value: Number,
          },
          shoulderWidth: {
            unit: String,
            value: Number,
          },
        },
      },
    ],
    color: [],
    tags: String,
    ratings: [
      {
        star: Number,
        comment: String,
        postedby: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    totalrating: {
      type: String,
      default: 0,
    },
    vendor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
    },
    regPriceCurr: {
      type: String
    },
    offerPriceCurr: {
      type: String
    }
  },
  { timestamps: true }
);


const Product = mongoose.model("Product", productSchema);

module.exports = Product;
