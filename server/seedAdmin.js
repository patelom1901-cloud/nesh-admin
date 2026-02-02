const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Admin = require("./models/Admin");

async function seedAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = "admin@nesh.com";
  const password = "admin123"; // 👈 SET A PASSWORD YOU WILL REMEMBER

  const hashedPassword = await bcrypt.hash(password, 10);

  await Admin.findOneAndUpdate(
    { email },
    { email, password: hashedPassword },
    { upsert: true, new: true }
  );

  console.log("✅ Admin reset complete");
  console.log("Email:", email);
  console.log("Password:", password);

  process.exit();
}

seedAdmin();
