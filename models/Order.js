const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,

  address: String,
  state: String,

  items: [
    {
      name: String,
      price: Number,
      quantity: Number,
      size: String,
      category: String
    }
  ],

  subtotal: Number,
  shippingFee: Number,
  totalAmount: Number,

  deliveryZone: {
    type: String,
    enum: ["Island", "Mainland", "Outside Lagos", "Nationwide"]
  },

  paymentRef: String,

  status: {
    type: String,
    default: "pending"
  },

  // ✅ ADD THIS
  paymentStatus: {
    type: String,
    default: "pending",
    enum: ["pending", "paid", "failed"]
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Order", OrderSchema);