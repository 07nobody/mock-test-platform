const mongoose = require("mongoose");

// Define the schema for a leaderboard entry
const leaderboardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "exams",
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    accuracy: {
      type: Number,
      default: 0,
    },
    timeTaken: {
      type: Number, // in seconds
      default: 0,
    },
    category: {
      type: String,
      default: "general",
    },
    isPassed: {
      type: Boolean,
      default: false,
    },
    rank: {
      type: Number,
      default: 0,
    },
    // To support time-based leaderboards (weekly, monthly, yearly)
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster querying
leaderboardSchema.index({ user: 1, exam: 1 });
leaderboardSchema.index({ category: 1 });
leaderboardSchema.index({ createdAt: 1 });
leaderboardSchema.index({ score: -1 }); // For sorting by highest score

// Create a compound index for category and score for category-based leaderboards
leaderboardSchema.index({ category: 1, score: -1 });

const Leaderboard = mongoose.model("leaderboard", leaderboardSchema);

module.exports = Leaderboard;