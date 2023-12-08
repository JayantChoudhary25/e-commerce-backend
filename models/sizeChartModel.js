const mongoose = require("mongoose");

const sizeChartSchema = new mongoose.Schema(
  {
    sizeChart: [
      {
        size: String, // e.g., 'S', 'M', 'L', etc.
        measurements: {
          chest: {
            unit: String, // e.g., 'inches', 'centimeters', etc.
            value: Number,
          },
          waist: {
            unit: String,
            value: Number,
          },
          hips: {
            unit: String,
            value: Number,
          },
          length: {
            unit: String,
            value: Number,
          },
          sleeveLength: {
            unit: String,
            value: Number,
          },
          shoulderWidth: {
            unit: String,
            value: Number,
          },
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const SizeChart = mongoose.model("SizeChart", sizeChartSchema);

module.exports = SizeChart;
