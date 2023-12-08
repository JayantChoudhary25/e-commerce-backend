const mongoose = require("mongoose");

const prodcategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // subCategory
  },
  {
    timestamps: true,
  }
);

const PCategory = mongoose.model("PCategory", prodcategorySchema);

module.exports = PCategory;
