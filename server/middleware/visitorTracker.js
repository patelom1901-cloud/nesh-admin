const http = require("http");
const Visitor = require("../models/Visitor");

const getGeoData = (ip) => {
  return new Promise((resolve) => {
    // Skip local IPs
    if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.")) {
      return resolve({});
    }

    // Use ip-api.com (Free, no key required)
    const url = `http://ip-api.com/json/${ip}`;

    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (json.status === "success") {
            resolve(json);
          } else {
            resolve({});
          }
        } catch (e) {
          resolve({});
        }
      });
    }).on("error", () => {
      resolve({});
    });
  });
};

const visitorTracker = async (req, res, next) => {
  try {
    const path = req.path;

    // Ignore rules
    if (
      path.startsWith("/api/admin") ||
      path === "/login.html" ||
      path.startsWith("/js/") ||
      path.startsWith("/css/") ||
      path.includes("favicon.ico")
    ) {
      return next();
    }

    // Extract IP safely
    let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    if (ip && ip.includes(",")) ip = ip.split(",")[0].trim();
    if (ip && ip.includes("::ffff:")) ip = ip.split("::ffff:")[1];

    if (!ip) return next();

    // Find or Create Visitor
    let visitor = await Visitor.findOne({ ip });

    if (visitor) {
      visitor.visits += 1;
      visitor.lastVisited = new Date();
      if (!visitor.pages.includes(path)) {
        visitor.pages.push(path);
      }
      await visitor.save();
    } else {
      const geo = await getGeoData(ip);
      
      await Visitor.create({
        ip,
        country: geo.country || "",
        state: geo.regionName || "",
        city: geo.city || "",
        latitude: geo.lat || 0,
        longitude: geo.lon || 0,
        pages: [path],
        visits: 1,
        lastVisited: new Date()
      });
    }

    next();
  } catch (err) {
    console.error("Visitor Tracker Error:", err.message);
    next(); // Ensure request is never blocked
  }
};

module.exports = visitorTracker;