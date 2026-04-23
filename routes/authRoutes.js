const express = require("express")
const router = express.Router()
const { adminLogin, verifyOtp, verifyToken } = require("../controllers/authController")
const { protectAdmin } = require("../middleware/authMiddleware")

router.post("/admin-login", adminLogin)
router.post("/verify-otp", verifyOtp)
router.get("/verify-token", protectAdmin, verifyToken)

module.exports = router