const Color = require("../models/colorModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

exports.createColor = async (req, res) => {
  try {
    const newColor = await Color.create(req.body);
    res.json(newColor);
  } catch (error) {
    throw new Error(error);
  }
};

exports.updateColor = async (req, res) => {
  const { id } = req.body;
  validateMongoDbId(id);
  try {
    const updatedColor = await Color.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedColor);
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteColor = async (req, res) => {
  const { id } = req.body;
  validateMongoDbId(id);
  try {
    const deletedColor = await Color.findByIdAndDelete(id);
    res.json(deletedColor);
  } catch (error) {
    throw new Error(error);
  }
};

exports.getColors = async (req, res) => {
  try {
    const colors = await Color.find();
    res.json(colors);
  } catch (error) {
    throw new Error(error);
  }
};

exports.getaColor = async (req, res) => {
  const { id } = req.body;
  validateMongoDbId(id);

  try {
    const result = await Color.findById(id);
    res.json({
      result,
    });
  } catch (error) {
    throw new Error(error);
  }
};
