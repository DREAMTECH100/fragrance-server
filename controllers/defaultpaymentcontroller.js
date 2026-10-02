const axios = require("axios");
const Order = require("../models/Order");

// ================= INIT PAYMENT =================
exports.initializePayment = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      address,
      state,
      items,
      subtotal,
      shippingFee,
      totalAmount
    } = req.body;

    if (!email || !totalAmount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const reference = `ref_${Date.now()}`;

    // Save pending order
    const pendingOrder = new Order({
      fullName,
      email,
      phone,
      address,
      state,
      items,
      subtotal,
      shippingFee,
      totalAmount,
      paymentRef: reference,
      status: "pending"
    });

    await pendingOrder.save();

    // FRONTEND callback URL
    const callbackUrl = `${process.env.FRONTEND_URL}/order-success?reference=${reference}`;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: totalAmount * 100, // Paystack expects kobo
        reference,
        callback_url: callbackUrl
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({
      ...response.data,
      reference
    });

  } catch (error) {
    console.log("INIT PAYMENT ERROR:", error.response?.data || error.message);
    res.status(500).json({ message: "Payment initialization failed" });
  }
};

// ================= VERIFY PAYMENT =================
exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ success: false, status: "failed", message: "Reference is required" });
    }

    // Find order by reference
    const order = await Order.findOne({ paymentRef: reference });

    if (!order) {
      return res.status(404).json({ success: false, status: "failed", message: "Order not found" });
    }

    // If already paid
    if (order.status === "paid") {
      return res.json({ success: true, status: "paid", message: "Order already verified", order });
    }

    // Verify with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const data = response.data.data;

    if (data.status === "success") {
      order.status = "paid";
      await order.save();
      return res.json({ success: true, status: "paid", message: "Payment verified successfully", order });
    } else if (data.status === "pending") {
      order.status = "pending";
      await order.save();
      return res.json({ success: false, status: "pending", message: "Payment is pending", order });
    } else {
      order.status = "failed";
      await order.save();
      return res.json({ success: false, status: "failed", message: "Payment failed", order });
    }

  } catch (error) {
    console.log("VERIFY ERROR:", error.response?.data || error.message);
    return res.status(500).json({ success: false, status: "pending", message: "Verification failed, try again later" });
  }
};