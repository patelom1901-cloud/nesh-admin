const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");

// PUBLIC: submit lead
router.post("/", async (req, res) => {
  try {
    const { name, phone, email, message, page } = req.body;

    if (!name || !phone || !page) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, phone, and page are required" 
      });
    }

    const newLead = new Lead({
      name,
      phone,
      email: email || "",
      message: message || "",
      page
    });

    await newLead.save();

    res.status(201).json({
      success: true,
      message: "Lead saved"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
