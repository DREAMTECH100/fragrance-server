const express = require("express")
const router = express.Router()
const { protectAdmin } = require("../middleware/authMiddleware")
const Order = require("../models/Order") // ✅ FIX

router.get("/orders", protectAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })
    res.json(orders)
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders" })
  }
})

module.exports = router