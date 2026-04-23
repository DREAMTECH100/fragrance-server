const express = require("express");
const router = express.Router();
const Review = require("../models/Review");

// GET reviews
router.get("/:productId", async (req, res) => {
  const reviews = await Review.find({
    productId: req.params.productId
  }).sort({ createdAt: -1 });

  res.json(reviews);
});

// ADD review
router.post("/", async (req, res) => {
  const review = new Review(req.body);
  await review.save();
  res.json(review);
});

module.exports = router;