const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    vendorName: {
        type: String,
        required: true,
    },
    companyName: {
        type: String,
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    address: {
        type: String
    }
  },
  {
    timestamps: true,
  }
);

const Vendor = mongoose.model("Vendor", vendorSchema);

module.exports = Vendor;
