const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const multer = require("multer");
const path = require("path");

// Cloudinary setup
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// ✅ ENV CONFIG
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

router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) return res.json([]);

    const products = await Product.find({
      name: { $regex: q, $options: "i" },
    });

    res.json(products);
  } catch (err) {
    console.error("SEARCH ERROR:", err);
    res.status(500).json({ message: "Search failed" });
  }
});
/* =========================
   GET ALL PRODUCTS
========================= */
router.get("/", async (req, res) => {
  try {
    const { category, subCategory } = req.query;

    const filter = {};

    if (category) {
      filter.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

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

/* =========================
   UPLOAD IMAGE
========================= */
router.post("/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    res.json({ url: req.file.path });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ message: "Error uploading image" });
  }
});

/* =========================
   ADD PRODUCT
========================= */
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
      sizes = [],
      isPreorder = false, // ✅ FIXED
    } = req.body;

    if (!name || !price || !category || !image) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const parsedSizes = sizes.map((s) => ({
      label: s.label,
      price: Number(s.price),
    }));

    const product = new Product({
      name,
      price: Number(price),
      category,
      subCategory: subCategory.trim(),
      description,
      image,
      stock: Number(stock) || 0,
      sizes: parsedSizes,
      isPreorder: Boolean(isPreorder), // ✅ FIXED
    });

    await product.save();

    res.status(201).json(product);
  } catch (err) {
    console.error("PRODUCT SAVE ERROR:", err);
    res.status(500).json({ message: "Error adding product" });
  }
});

/* =========================
   DELETE PRODUCT
========================= */
router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("DELETE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Error deleting product" });
  }
});

/* =========================
   GET SINGLE PRODUCT
   (CLEANED DUPLICATE FIX)
========================= */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error("GET PRODUCT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   UPDATE PRODUCT
========================= */
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
      sizes = [],
      isPreorder = false, // ✅ FIXED
    } = req.body;

    const parsedSizes = sizes.map((s) => ({
      label: s.label,
      price: Number(s.price),
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
        isPreorder: Boolean(isPreorder), // ✅ FIXED
      },
      { new: true }
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