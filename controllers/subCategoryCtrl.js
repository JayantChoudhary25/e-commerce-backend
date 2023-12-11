const SubCategory = require("../models/subCategoryModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

exports.createSubCategory = async (req, res) => {
  try {
    const newCategory = await SubCategory.create(req.body);
    res.json(newCategory);
  } catch (error) {
    throw new Error(error);
  }
};

exports.updateSubCategory = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatedCategory = await SubCategory.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedCategory);
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteSubCategory = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletedCategory = await SubCategory.findByIdAndDelete(id);
    res.json(deletedCategory);
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteBulkSubCategory = async (req, res) => {
  try {
    const { CategoryIds } = req.body;
    const deleteCategorys = await SubCategory.deleteMany({ _id: { $in: CategoryIds } });
    res.json(deleteCategorys);
  } catch (error) {
    throw new Error(error);
  }
};

exports.getSubCategory = async (req, res) => {
  const { id } = req.body;
  validateMongoDbId(id);
  try {
    const getaCategory = await SubCategory.findById(id);
    res.json(getaCategory);
  } catch (error) {
    throw new Error(error);
  }
};

exports.getallSubCategory = async (req, res) => {
  try {
    const getallCategory = await SubCategory.find();
    res.json(getallCategory);
  } catch (error) {
    throw new Error(error);
  }
};
