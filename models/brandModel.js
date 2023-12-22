const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    category: {
      type: [String]
    },
    subCategory: {
      type: [String]
    }
  },
  {
    timestamps: true,
  }
);

const Brand = mongoose.model("Brand", brandSchema);

module.exports = Brand;
