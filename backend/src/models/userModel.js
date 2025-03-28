 
const mongoose = require("mongoose");

// ✅ Define User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true, // 🔹 Removes extra spaces
  },
  password: {
    type: String,
    required: true,
  },
}, { timestamps: true }); // 🔹 Adds createdAt & updatedAt fields automatically

// ✅ Create and Export User Model
const User = mongoose.model("User", userSchema);
module.exports = User;
