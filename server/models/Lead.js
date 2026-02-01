const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    product: {
      type: String,
      required: true
    },
    page: {
      type: String
    },
    ip: {
      type: String
    },
    country: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", LeadSchema);
