const Product = require("../models/Product");

// GET all products with optional filters
exports.getProducts = async (req, res) => {
  try {
    const { category, subCategory } = req.query;

    const filter = {};

    if (category) {
      filter.category = { $regex: new RegExp(`^${category}$`, "i") }; // case-insensitive exact
    }

    if (subCategory) {
      filter.subCategory = { $regex: new RegExp(`^${subCategory}$`, "i") };
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ADD product (supports both old and new format)
exports.addProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      category,
      subCategory = "",
      description,
      image,
      stock,
      sizes = []
    } = req.body;

    const parsedSizes = sizes.map(s => ({
      label: s.label,
      price: Number(s.price)
    }));

    const newProduct = new Product({
      name,
      price: Number(price),
      category,
      subCategory,
      description,
      image,
      stock: Number(stock) || 0,
      sizes: parsedSizes,
    });

    await newProduct.save();

    res.status(201).json({
      message: "Product added",
      product: newProduct
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add product" });
  }
};

// You can add update/delete later if needed

module.exports = {
  getProducts,
  addProduct,
  // ...
};