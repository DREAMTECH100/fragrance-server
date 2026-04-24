const jwt = require("jsonwebtoken")
const emailService = require("../utils/emailService")
const bcrypt = require("bcrypt")

let otpStore = {}        // LOGIN OTP
let resetOtpStore = {}   // PASSWORD RESET OTP (NEW)


// =========================
// 🔐 ADMIN LOGIN (UNCHANGED)
// =========================
const adminLogin = async (req, res) => {
  const { email, password } = req.body

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

  // Plain text check (current working setup)
  let isValidPassword = password === ADMIN_PASSWORD

  // Future upgrade option
  // let isValidPassword = await bcrypt.compare(password, ADMIN_PASSWORD)

  if (email !== ADMIN_EMAIL || !isValidPassword) {
    return res.status(400).json({ message: "Invalid credentials" })
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()

  otpStore[email] = otp

  try {
    await emailService(
      email,
      "Your Admin Login OTP",
      `Your verification code is: ${otp}`
    )

    res.json({ message: "OTP sent to email" })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Failed to send OTP" })
  }
}


// =========================
// 🔐 VERIFY LOGIN OTP
// =========================
const verifyOtp = (req, res) => {
  const { email, otp } = req.body

  if (otpStore[email] !== otp) {
    return res.status(400).json({ message: "Invalid OTP" })
  }

  delete otpStore[email]

  const token = jwt.sign(
    { email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  )

  res.json({ token })
}


// =========================
// 🔐 VERIFY TOKEN
// =========================
const verifyToken = (req, res) => {
  res.json({ message: "Valid token" })
}


// =======================================================
// 🔐 FORGOT PASSWORD (NEW - SAFE ADDITION)
// =======================================================
const forgotPassword = async (req, res) => {
  const { email } = req.body

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL

  if (email !== ADMIN_EMAIL) {
    return res.status(400).json({ message: "Email not recognized" })
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString()

  resetOtpStore[email] = otp

  try {
    await emailService(
      email,
      "Password Reset OTP",
      `Your password reset code is: ${otp}`
    )

    res.json({ message: "Reset OTP sent to email" })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Failed to send reset OTP" })
  }
}


// =======================================================
// 🔐 RESET PASSWORD (NEW - SAFE ADDITION)
// =======================================================
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL

  if (email !== ADMIN_EMAIL) {
    return res.status(400).json({ message: "Invalid email" })
  }

  if (resetOtpStore[email] !== otp) {
    return res.status(400).json({ message: "Invalid OTP" })
  }

  delete resetOtpStore[email]

  try {
    // ⚠️ IMPORTANT:
    // This updates runtime password only (env-based system)
    process.env.ADMIN_PASSWORD = newPassword

    res.json({ message: "Password reset successful" })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Failed to reset password" })
  }
}


// =========================
// EXPORTS
// =========================
module.exports = {
  adminLogin,
  verifyOtp,
  verifyToken,
  forgotPassword,
  resetPassword
}