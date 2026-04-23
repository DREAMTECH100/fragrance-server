const express = require("express");
const router = express.Router();

// Correct import — match exact filename
const { initializePayment, verifyPayment } = require("../controllers/paymentController");

// Initialize payment
router.post("/initialize", initializePayment);

// Verify payment from frontend (order-success)
router.post("/verify", verifyPayment);

// Optional: Paystack webhook for automatic updates
router.post("/webhook", express.json({ type: "*/*" }), async (req, res) => {
  const event = req.body;
  if (event.event === "charge.success") {
    const reference = event.data.reference;
    const Order = require("../models/Order");
    const order = await Order.findOne({ paymentRef: reference });
    if (order && order.status !== "paid") {
      order.status = "paid";
      await order.save();
    }
  }
  res.status(200).send("ok");
});

module.exports = router;