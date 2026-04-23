const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const authRoutes = require("./routes/authRoutes")
const reviewRoutes = require("./routes/reviewRoutes");
const webhookRoutes = require("./routes/webhookRoutes");


require("dotenv").config()
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const app = express()

// Routes
const productRoutes = require("./routes/productRoutes")
const orderRoutes = require("./routes/orderRoutes")
const adminRoutes = require("./routes/adminRoutes")
const paymentRoutes = require("./routes/paymentRoutes")

// Middleware
app.use(cors())
app.use(express.json())

// Serve uploaded images
app.use("/uploads", express.static("uploads"))
app.use(
  "/api/webhook/paystack",
  express.raw({ type: "application/json" })
);


// API Routes
app.use("/api/webhook/paystack", webhookRoutes);
app.use("/api/products", productRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/payment", paymentRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/reviews", reviewRoutes);
app.get("/", (req, res) => {
  res.send("API is running")
})

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err))

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})