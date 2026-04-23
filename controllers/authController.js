const jwt = require("jsonwebtoken")
const emailService = require("../utils/emailService")
const bcrypt = require("bcrypt")

let otpStore = {} // temporary memory store

// 🔐 LOGIN
const adminLogin = async (req, res) => {
  const { email, password } = req.body

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

  // ❗ OPTION 1: Plain text (works immediately)
  let isValidPassword = password === ADMIN_PASSWORD

  // ❗ OPTION 2 (better): Hashed password (uncomment when ready)
  // let isValidPassword = await bcrypt.compare(password, ADMIN_PASSWORD)

  if (email !== ADMIN_EMAIL || !isValidPassword) {
    return res.status(400).json({ message: "Invalid credentials" })
  }

  // GENERATE OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()

  // STORE OTP
  otpStore[email] = otp

  // SEND EMAIL
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


// 🔐 VERIFY OTP
const verifyOtp = (req, res) => {
  const { email, otp } = req.body

  if (otpStore[email] !== otp) {
    return res.status(400).json({ message: "Invalid OTP" })
  }

  // DELETE USED OTP
  delete otpStore[email]

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "1d"
  })

  res.json({ token })
}


// 🔐 VERIFY TOKEN
const verifyToken = (req, res) => {
  res.json({ message: "Valid token" })
}

module.exports = {
  adminLogin,
  verifyOtp,
  verifyToken
}