const Currency = require("../models/currencyModel");
const validateMongoDbId = require("../utils/validateMongodbId");

exports.createCurrency = async (req, res) => {
  const newCurrency = await Currency.create(req.body);
  res.json(newCurrency);
};

exports.updateCurrency = async (req, res) => {
  const { id } = req.body;
  validateMongoDbId(id);
  const updatedCurrency = await Currency.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  res.json(updatedCurrency);
};

exports.deleteCurrency = async (req, res) => {
  const { id } = req.body;
  validateMongoDbId(id);
  const deletedCurrency = await Currency.findByIdAndDelete(id);
  res.json(deletedCurrency);
};

exports.getCurrency = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  const getCurrency = await Currency.findById(id);
  res.json(getCurrency);
};

exports.getAllCurrencies = async (req, res) => {
  try {
    const currencies = await Currency.find();
    res.json(currencies);
  } catch (error) {
    throw new Error(error);
  }
};