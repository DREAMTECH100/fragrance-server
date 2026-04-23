const express = require("express");
const router = express.Router();

const { createOrder } = require("../controllers/orderController");
const Order = require("../models/Order");

// CREATE ORDER
router.post("/", createOrder);

// GET ALL ORDERS
router.get("/", async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

module.exports = router;