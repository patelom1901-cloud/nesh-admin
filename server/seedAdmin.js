const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const Admin = require("./models/Admin");

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const exists = await Admin.findOne({ email: "admin@nesh.com" });
  if (exists) {
    console.log("Admin already exists");
    process.exit();
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await Admin.create({
    email: "admin@nesh.com",
    password: hashedPassword
  });

  console.log("Admin created");
  process.exit();
}

seed();
