const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");
const Visitor = require("../models/Visitor");
const sendMail = require("../utils/mailer");

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

    // 1. Extract IP safely (Mirroring visitorTracker logic)
    let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    if (ip && ip.includes(",")) ip = ip.split(",")[0].trim();
    if (ip && ip.includes("::ffff:")) ip = ip.split("::ffff:")[1];

    // 2. Find Visitor
    let visitor = await Visitor.findOne({ ip });

    const newLead = new Lead({
      name,
      phone,
      email: email || "",
      message: message || "",
      page,
      ip: ip || "0.0.0.0",
      visitorId: visitor ? visitor._id : null
    });

    await newLead.save();

    // 3. Email Notifications
    try {
      // Prepare location string
      const location = (visitor && [visitor.city, visitor.state, visitor.country].filter(Boolean).join(", ")) || "Unknown";

      const adminHtml = `
        <h3>New Lead Received</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email || "Not provided"}</p>
        <p><strong>Message:</strong> ${message || "No message"}</p>
        <p><strong>Page:</strong> ${page}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      `;

      // Send to Admin
      if (process.env.ADMIN_EMAIL) {
        sendMail({
          to: process.env.ADMIN_EMAIL,
          subject: `[LEAD] ${name} – ${page}`,
          html: adminHtml,
        });
      }

      // Auto-reply to User
      if (email) {
        sendMail({
          to: email,
          subject: "We received your message",
          html: "<p>Thanks for contacting Nesh Industries. We’ll get back to you shortly.</p>",
        });
      }
    } catch (mailErr) {
      console.error("Lead email notification failed:", mailErr.message);
    }

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
