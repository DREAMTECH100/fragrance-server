const Order = require("../models/Order");
const sendOrderEmail = require("../utils/emailService");

exports.createOrder = async (req, res) => {
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
      totalAmount,

      deliveryZone,
      paymentRef
    } = req.body;

    // 💀 STORE FULL SNAPSHOT (NO RE-CALCULATION)
    const newOrder = new Order({
      fullName,
      email,
      phone,
      address,
      state,

      items,

      subtotal,
      shippingFee,
      totalAmount,

      deliveryZone,
      paymentRef,

      status: "paid"
    });

    const savedOrder = await newOrder.save();

    // OPTIONAL EMAIL (we will upgrade next step)
    // await sendOrderEmail(savedOrder);

    return res.status(201).json({
      success: true,
      order: savedOrder
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create order"
    });
  }
};