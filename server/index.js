const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ✅ SERVE STATIC FILES
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
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));

// routes
const leadRoutes = require("./routes/leads");
app.use("/api/leads", leadRoutes);

const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
