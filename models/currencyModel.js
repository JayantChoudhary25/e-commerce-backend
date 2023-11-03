const mongoose = require("mongoose");

const currencySchema = new mongoose.Schema(
  {
    currencySign: {
      type: String,
    },
    currencyName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Currency = mongoose.model("Currency", currencySchema);

module.exports = Currency;
