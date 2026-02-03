const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");

const Admin = require("../models/Admin");
const Lead = require("../models/Lead");

const router = express.Router();

/**
 * CREATE ADMIN (run ONCE)
 */
router.post("/create-admin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({
      email,
      password: hashedPassword,
      role: "admin"
    });

    await admin.save();

    res.json({ message: "Admin created successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * LOGIN
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PROTECTED DASHBOARD
 */
router.get("/dashboard", auth, (req, res) => {
  res.json({
    message: "Welcome to admin dashboard",
    admin: req.admin
  });
});

/**
 * LEADS SUMMARY (COUNT + LATEST 10)
 */
router.get("/leads", auth, async (req, res) => {
  try {
    const total = await Lead.countDocuments();

    const latest = await Lead.find()
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      totalLeads: total,
      latestLeads: latest
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
