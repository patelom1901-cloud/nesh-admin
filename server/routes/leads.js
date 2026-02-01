const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");

// PUBLIC: submit lead
router.post("/", async (req, res) => {
  try {
    const { name, phone, product, page } = req.body;

    if (!name || !phone || !product) {
      return res.status(400).json({ message: "All fields required" });
    }

    const lead = await Lead.create({
      name,
      phone,
      product,
      page: page || "unknown",
      ip: req.ip,
      country: req.headers["x-country"] || "unknown"
    });

    res.status(201).json({
      message: "Lead submitted successfully",
      leadId: lead._id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
