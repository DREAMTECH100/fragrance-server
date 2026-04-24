const crypto = require("crypto");
const Order = require("../models/Order");

exports.paystackWebhook = async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    // VERIFY PAYSTACK SIGNATURE
    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(400).send("Invalid signature");
    }

    const event = req.body;

    // 🎯 ONLY CARE ABOUT SUCCESSFUL PAYMENT
    if (event.event === "charge.success") {
      const reference = event.data.reference;

      const order = await Order.findOne({ paymentRef: reference });

      if (!order) {
        return res.status(404).send("Order not found");
      }

      // PREVENT DOUBLE UPDATES
      if (order.status === "paid") {
        return res.sendStatus(200);
      }

      order.paymentStatus = "paid";
order.status = "success"; // optional but good for UI
      await order.save();

      console.log("✅ Payment verified via webhook:", reference);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error);
    res.sendStatus(500);
  }
};