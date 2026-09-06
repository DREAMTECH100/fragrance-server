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

    // 🔥 STOCK COUNT
    // This is the single source of truth for "out of stock" — the
    // frontend treats stock <= 0 as out of stock. Defaulting to 0 (not
    // undefined) means any product created without an explicit stock
    // value is correctly treated as out of stock instead of silently
    // reading as available. min: 0 blocks negative values.
    stock: { type: Number, default: 0, min: 0 },

    // 🔥 MULTIPLE SIZES
    sizes: [sizeSchema],

    // 🆕 PREORDER FLAG (NEW ADDITION ONLY)
    isPreorder: { type: Boolean, default: false },

    // 🆕 MANUAL OUT-OF-STOCK OVERRIDE
    // Distinct from `stock` count — lets admin pause sales on an item
    // even if units are technically left (e.g. damaged, recalled,
    // reserved). The frontend treats a product as out of stock when
    // EITHER this is true OR stock <= 0.
    outOfStock: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
