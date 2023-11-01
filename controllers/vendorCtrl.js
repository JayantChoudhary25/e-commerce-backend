const Vendor = require("../models/vendorModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

exports.createVendor = async (req, res) => {
  const newVendor = await Vendor.create(req.body);
  res.json(newVendor);
};

exports.updateVendor = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  const updatedVendor = await Vendor.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  res.json(updatedVendor);
};

exports.deleteVendor = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  const deletedVendor = await Vendor.findByIdAndDelete(id);
  res.json(deletedVendor);
};

exports.getAllVendors = async (req, res) => {
  const vendors = await Vendor.find();
  res.json(vendors);
};

exports.getaVendor = async (req, res) => {
  const { _id } = req.body;
  validateMongoDbId(_id);

  try {
    const result = await Vendor.findById(_id);
    res.json({
      result,
    });
  } catch (error) {
    throw new Error(error);
  }
};