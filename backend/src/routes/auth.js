const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// API routes for authentication
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, email, and password are required." });
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email: email.toLowerCase() }],
    });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Username or email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ username, email: email.toLowerCase(), passwordHash });

    return res
      .status(201)
      .json({ message: "Registration successful. Please log in." });
  } catch (error) {
    console.log("Registration failed:", error);
    return res.status(500).json({ message: "Registration failed." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res.json({ token, username: user.username, email: user.email });
  } catch (error) {
    console.log("Login failed:", error);
    return res.status(500).json({ message: "Login failed." });
  }
});

router.get("/me", authMiddleware, (req, res) => {
  return res.json({ username: req.user.username, email: req.user.email });
});

module.exports = router;
