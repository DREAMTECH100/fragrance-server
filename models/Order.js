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
      price: Number,           // amount actually charged per unit
      originalPrice: Number,   // SALE: price before discount
      discountPercent: Number, // SALE
      quantity: Number,
      size: String,
      category: String
    }
  ],

  subtotal: Number,
  originalSubtotal: Number, // SALE
  discountAmount: Number,   // SALE
  discountPercent: Number,  // SALE
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