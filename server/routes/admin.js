const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");

const Admin = require("../models/Admin");
const Lead = require("../models/Lead");
const Visitor = require("../models/Visitor");
const SystemSetting = require("../models/SystemSetting");

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
 * GET LATEST LEADS
 */
router.get("/leads", auth, async (req, res) => {
  try {
    const leads = await Lead.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("visitorId", "country state city visits pages")
      .lean();

    // Transform for clean merged response
    const data = leads.map(lead => {
      const v = lead.visitorId || {};
      return {
        name: lead.name,
        phone: lead.phone,
        message: lead.message,
        page: lead.page,
        createdAt: lead.createdAt,
        location: [v.city, v.state, v.country].filter(Boolean).join(", ") || "Unknown",
        visits: typeof v.visits === "number" ? v.visits : 0,
        pagesViewed: v.pages ? v.pages.length : 0
      };
    });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET VISITORS
 */
router.get("/visitors", auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const skip = parseInt(req.query.skip) || 0;

    const visitors = await Visitor.find()
      .sort({ lastVisited: -1 })
      .skip(skip)
      .limit(limit)
      .select("-__v");

    res.json(visitors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET MAINTENANCE STATUS
 */
router.get("/maintenance", auth, async (req, res) => {
  try {
    const setting = await SystemSetting.findOne({ key: "maintenanceMode" });
    res.json({
      enabled: setting ? !!setting.value : false,
      source: "database",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * TOGGLE MAINTENANCE
 */
router.post("/maintenance", auth, async (req, res) => {
  try {
    let { enabled } = req.body;

    // Coerce to boolean if it's a string "true" or "false"
    if (enabled === 'true') enabled = true;
    if (enabled === 'false') enabled = false;

    if (typeof enabled !== "boolean") { // Now validate
      return res.status(400).json({
        message: "enabled must be a boolean (true or false)",
      });
    }

    await SystemSetting.findOneAndUpdate(
      { key: "maintenanceMode" },
      { value: enabled },
      { upsert: true, new: true }
    );

    res.json({
      message: `Maintenance mode ${enabled ? "ON" : "OFF"}`,
      enabled,
    });
  } catch (err) {
    console.error("Toggle maintenance error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
