const express = require("express")
const router = express.Router()

const {
  adminLogin,
  verifyOtp,
  verifyToken,
  forgotPassword,
  resetPassword
} = require("../controllers/authController")

const { protectAdmin } = require("../middleware/authMiddleware")


// =========================
// 🔐 EXISTING ROUTES (UNCHANGED)
// =========================
router.post("/admin-login", adminLogin)
router.post("/verify-otp", verifyOtp)
router.get("/verify-token", protectAdmin, verifyToken)


// =========================
// 🔐 NEW PASSWORD RESET ROUTES
// =========================

// Send OTP for password reset
router.post("/forgot-password", forgotPassword)

// Reset password using OTP
router.post("/reset-password", resetPassword)


module.exports = router