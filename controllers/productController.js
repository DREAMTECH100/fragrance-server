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
      sizes = [],
      isPreorder = false,
      outOfStock = false,
    } = req.body;

    const parsedSizes = sizes.map(s => ({
      label: s.label,
      price: Number(s.price)
    }));

    // If stock is explicitly 0 and outOfStock wasn't sent as true already,
    // still mark it out of stock — mirrors the auto-flip behavior in the admin form.
    const resolvedOutOfStock = outOfStock || Number(stock) === 0;

    const newProduct = new Product({
      name,
      price: Number(price),
      category,
      subCategory,
      description,
      image,
      stock: Number(stock) || 0,
      sizes: parsedSizes,
      isPreorder,
      outOfStock: resolvedOutOfStock,
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

// UPDATE product — used for editing an existing product, including
// toggling outOfStock/isPreorder or changing stock quantity.
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      price,
      category,
      subCategory,
      description,
      image,
      stock,
      sizes,
      isPreorder,
      outOfStock,
    } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = Number(price);
    if (category !== undefined) product.category = category;
    if (subCategory !== undefined) product.subCategory = subCategory;
    if (description !== undefined) product.description = description;
    if (image !== undefined) product.image = image;
    if (isPreorder !== undefined) product.isPreorder = isPreorder;

    if (sizes !== undefined) {
      product.sizes = sizes.map(s => ({
        label: s.label,
        price: Number(s.price),
      }));
    }

    if (stock !== undefined) {
      product.stock = Number(stock) || 0;
      // Auto-flip outOfStock when stock is set to 0, same as the admin form,
      // unless the request explicitly overrides outOfStock itself below.
      if (outOfStock === undefined) {
        product.outOfStock = product.stock === 0;
      }
    }

    // An explicit outOfStock value in the request always wins (manual toggle).
    if (outOfStock !== undefined) {
      product.outOfStock = outOfStock;
    }

    await product.save();

    res.status(200).json({
      message: "Product updated",
      product,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update product" });
  }
};

module.exports = {
  getProducts: exports.getProducts,
  addProduct: exports.addProduct,
  updateProduct: exports.updateProduct,
  // ...
};
