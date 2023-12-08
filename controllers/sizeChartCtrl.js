const SizeChart = require("../models/sizeChartModel");
const validateMongoDbId = require("../utils/validateMongodbId");

exports.createSizeChart = async (req, res) => {
  try {
    const newSizeChart = await SizeChart.create(req.body);
    res.status(201).json(newSizeChart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSizeChart = async (req, res) => {
  const { _id } = req.body;
  validateMongoDbId(_id);
  try {
    const updatedSizeChart = await SizeChart.findByIdAndUpdate(_id, req.body, {
      new: true,
    });
    if (updatedSizeChart) {
      res.status(200).json(updatedSizeChart); 
    } else {
      res.status(404).json({ error: "Size chart not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteSizeChart = async (req, res) => {
  const { _id } = req.body;
  validateMongoDbId(_id);
  try {
    const deletedSizeChart = await SizeChart.findByIdAndDelete(_id);
    if (deletedSizeChart) {
      res.status(200).json(deletedSizeChart);
    } else {
      res.status(404).json({ error: "Size chart not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSizeChart = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getSizeChart = await SizeChart.findById(id);
    if (getSizeChart) {
      res.status(200).json(getSizeChart); 
    } else {
      res.status(404).json({ error: "Size chart not found" }); 
    }
  } catch (error) {
    res.status(500).json({ error: error.message }); 
  }
};

exports.getAllSizeCharts = async (req, res) => {
  try {
    const sizeCharts = await SizeChart.find();
    res.status(200).json(sizeCharts); 
  } catch (error) {
    res.status(500).json({ error: error.message }); 
  }
};
