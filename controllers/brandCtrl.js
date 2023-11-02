const Brand = require("../models/brandModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

exports.createBrand = async (req, res) => {
  try {
    const newBrand = await Brand.create(req.body);
    res.json(newBrand);
  } catch (error) {
    throw new Error(error);
  }
};

exports.updateBrand = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatedBrand = await Brand.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedBrand);
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteBrand = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletedBrand = await Brand.findByIdAndDelete(id);
    res.json(deletedBrand);
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteBulkBrands = async (req, res) => {
    try {
      const { brandIds } = req.body; 
      const deletedBrands = await Brand.deleteMany({ _id: { $in: brandIds } });
      res.json(deletedBrands);
    } catch (error) {
      throw new Error(error);
    }
};

exports.getBrand = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getaBrand = await Brand.findById(id);
    res.json(getaBrand);
  } catch (error) {
    throw new Error(error);
  }
};

exports.getallBrand = async (req, res) => {
  try {
    const searchQuery = req.query.search; // Get the search query from the request query parameters

    // Create a Mongoose query to search for brands
    const brandQuery = Brand.find();

    // If a search query is provided, use it to filter the results
    if (searchQuery) {
      brandQuery.regex("brand", new RegExp(searchQuery, "i")); // Case-insensitive search
    }

    const brands = await brandQuery.exec();
    res.json(brands);
  } catch (error) {
    throw new Error(error);
  }
};