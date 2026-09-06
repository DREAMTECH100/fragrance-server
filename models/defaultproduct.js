const mongoose = require("mongoose");

const sizeSchema = new mongoose.Schema({
  label: String,   // e.g. 50ml
  price: Number,   // price for that size
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    // 🔥 DEFAULT PRICE (fallback)
    price: { type: Number, required: true },

    category: { type: String, required: true },
    subCategory: { type: String, default: "" },

    description: String,
    image: String,
    stock: Number,

    // 🔥 MULTIPLE SIZES
    sizes: [sizeSchema],

    // 🆕 PREORDER FLAG (NEW ADDITION ONLY)
    isPreorder: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);