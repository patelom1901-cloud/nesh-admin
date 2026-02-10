const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const visitorTracker = require("./middleware/visitorTracker");
const maintenance = require("./middleware/maintenance");

dotenv.config();

const app = express();

// security FIRST
app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

app.use(cors());
app.use(express.json());

// MAINTENANCE MODE (Must be before static files and visitor tracker)
app.use(maintenance);

// REGISTER VISITOR TRACKER
app.use(visitorTracker);

// serve static admin UI
app.use(express.static("public"));

// DB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// health route
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Nesh Admin API is running"
  });
});

// routes
const leadRoutes = require("./routes/leads");
app.use("/api/leads", leadRoutes);

const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
