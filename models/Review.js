const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  productId: String,
  name: String,
  comment: String,
  rating: Number,
}, { timestamps: true });

module.exports = mongoose.model("Review", reviewSchema);