const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const multer = require("multer");
const path = require("path");

// Multer setup (unchanged)
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// ✅ Use environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "fragrance-products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

// GET ALL PRODUCTS - now with optional filters
router.get("/", async (req, res) => {
  try {
    const { category, subCategory } = req.query;

    const filter = {};

    // Case-insensitive exact match for category
    if (category) {
      filter.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    // Case-insensitive exact match for subCategory (only if provided)
    if (subCategory) {
      filter.subCategory = { $regex: new RegExp(`^${subCategory}$`, "i") };
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.error("GET PRODUCTS ERROR:", err);
    res.status(500).json({ message: "Error fetching products" });
  }
});

// UPLOAD IMAGE (unchanged)
router.post("/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    res.json({ url: req.file.path });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ message: "Error uploading image" });
  }
});

// ADD PRODUCT - now supports subCategory (optional)
router.post("/add", async (req, res) => {
  try {
    console.log("Incoming product:", req.body);

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

    if (!name || !price || !category || !image) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const parsedSizes = sizes.map(s => ({
      label: s.label,
      price: Number(s.price)
    }));

    const product = new Product({
      name,
      price: Number(price),
      category,
      subCategory: subCategory.trim(),
      description,
      image,
      stock: Number(stock) || 0,
      sizes: parsedSizes, // 🔥 THIS IS THE FIX
    });

    await product.save();

    res.status(201).json(product);

  } catch (err) {
    console.error("PRODUCT SAVE ERROR:", err);
    res.status(500).json({ message: "Error adding product" });
  }
});
// DELETE PRODUCT (unchanged)
router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("DELETE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Error deleting product" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error("GET PRODUCT BY ID ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// GET SINGLE PRODUCT BY ID 🔥🔥🔥
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);

  } catch (err) {
    console.error("GET SINGLE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// UPDATE PRODUCT ✅ (NEW - SAFE ADDITION)
router.put("/:id", async (req, res) => {
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

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        price: Number(price),
        category,
        subCategory: subCategory.trim(),
        description,
        image,
        stock: Number(stock) || 0,
        sizes: parsedSizes,
      },
      { new: true } // return updated doc
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updatedProduct);

  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Error updating product" });
  }
});


module.exports = router;