const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    resetToken: {
      type: String,
    },
    resetTokenExpiry: {
      type: Date,
    },
    score: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
