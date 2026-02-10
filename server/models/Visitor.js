const mongoose = require("mongoose");

const VisitorSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
    unique: true
  },
  country: String,
  state: String,
  city: String,
  latitude: Number,
  longitude: Number,
  pages: [String],
  visits: {
    type: Number,
    default: 1
  },
  lastVisited: {
    type: Date,
    default: Date.now
  }
}, { timestamps: false });

module.exports = mongoose.model("Visitor", VisitorSchema);