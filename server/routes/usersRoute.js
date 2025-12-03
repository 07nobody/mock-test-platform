const router = require("express").Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");
const Joi = require("joi");
const crypto = require("crypto");
const { sendOTPEmail } = require("../services/emailService");

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// user registration
router.post("/register", async (req, res) => {
  try {
    // Validate request body
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        success: false,
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
        success: false,
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;

    // Create new user
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      success: true,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Error creating user",
      error: error.message,
      success: false,
    });
  }
});

// user login
router.post("/login", async (req, res) => {
  try {
    // Validate request body
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        success: false,
      });
    }

    // Check if user exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({
        message: "User does not exist",
        success: false,
      });
    }

    // Check password
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(400).json({
        message: "Invalid password",
        success: false,
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      success: true,
      data: token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Error logging in",
      error: error.message,
      success: false,
    });
  }
});

// get user info
router.post("/get-user-info", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.body.userId).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    res.status(200).json({
      message: "User info fetched successfully",
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user info error:", error);
    res.status(500).json({
      message: "Error fetching user info",
      error: error.message,
      success: false,
    });
  }
});

// Leaderboard route
router.get("/leaderboard", async (req, res) => {
  try {
    const { limit = 10, period, examId } = req.query; // Add period and examId filters
    let query = {};
    
    // Apply time period filter
    if (period) {
      const now = new Date();
      let startDate = new Date();
      
      switch(period) {
        case 'weekly':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'monthly':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'yearly':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          // No filter for 'all-time'
          break;
      }
      
      if (period !== 'all-time') {
        query.createdAt = { $gte: startDate };
      }
    }
    
    // Get users based on filters
    let topUsers;
    
    if (examId) {
      // For specific exam, we need to get report data
      const Report = require("../models/reportModel");
      const reports = await Report.find({ exam: examId })
        .sort({ result: -1 })
        .limit(parseInt(limit))
        .populate('user', 'name')
        .select('user result');
      
      topUsers = reports.map(report => ({
        _id: report.user._id,
        name: report.user.name,
        score: report.result
      }));
    } else {
      // For general leaderboard, use the user score
      topUsers = await User.find(query)
        .sort({ score: -1 })
        .limit(parseInt(limit))
        .select("name score");
    }

    res.status(200).json({
      message: "Leaderboard fetched successfully",
      success: true,
      data: topUsers,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({
      message: "Error fetching leaderboard",
      success: false,
      error: error.message,
    });
  }
});

// Updated forgot-password route
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    const otpExpiry = Date.now() + 600000; // 10 minutes expiry

    user.otp = hashedOtp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.status(200).json({
      message: "OTP sent to your email",
      success: true,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      message: "Error sending OTP",
      success: false,
    });
  }
});

// Verify hashed OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    if (user.otp !== hashedOtp || user.otpExpiry < Date.now()) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
        success: false,
      });
    }

    // OTP is valid, clear it from the database
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({
      message: "OTP verified successfully",
      success: true,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      message: "Error verifying OTP",
      success: false,
    });
  }
});

// Reset password
router.post("/reset-password", async (req, res) => {
  try {
    console.log("Reset password request body:", req.body);
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({
        message: "Email and new password are required",
        success: false,
      });
    }
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    console.log("User found:", user);
    console.log("Attempting to update password for:", email);

    try {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();
      console.log("Password updated successfully for:", email);
    } catch (error) {
      console.error("Error updating password:", error);
      return res.status(500).json({
        message: "Error updating password",
        success: false,
      });
    }
    
    // Clear any reset tokens and OTPs
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    user.otp = undefined;
    user.otpExpiry = undefined;
    
    await user.save();

    res.status(200).json({
      message: "Password reset successful",
      success: true,
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      message: "Error resetting password",
      success: false,
    });
  }
});

module.exports = router;
