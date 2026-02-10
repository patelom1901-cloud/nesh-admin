const path = require("path");
const SystemSetting = require("../models/SystemSetting");

module.exports = async (req, res, next) => {
  try {
    const setting = await SystemSetting.findOne({ key: "maintenanceMode" });
    const isMaintenance = setting ? setting.value === true : false;

    if (!isMaintenance) {
      return next();
    }

    const p = req.path.toLowerCase();

    // Allow exact root only
    if (p === "/") {
      return next();
    }

    const allowedPrefixes = [
      "/api/admin",
      "/login",
      "/health",
      "/js/",
      "/css/",
      "/images/",
    ];

    if (allowedPrefixes.some(prefix => p.startsWith(prefix))) {
      return next();
    }

    const allowedAdminPages = [
      "/admin.html",
      "/admin-leads.html",
    ];

    if (allowedAdminPages.includes(p)) {
      return next();
    }

    res.status(503);

    if (req.accepts("html")) {
      return res.sendFile(
        path.join(__dirname, "../public/maintenance.html")
      );
    }

    return res.json({ message: "Maintenance mode" });

  } catch (err) {
    console.error("Maintenance middleware error:", err);
    next(); // fail open
  }
};
