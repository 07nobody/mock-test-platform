const authMiddleware = require("../middlewares/authMiddleware");
const Exam = require("../models/examModel");
const User = require("../models/userModel");
const Report = require("../models/reportModel");
const Leaderboard = require("../models/leaderboardModel");
const router = require("express").Router();

// add report
router.post("/add-report", authMiddleware, async (req, res) => {
  try {
    console.log("===================== NEW REPORT SUBMISSION =====================");
    console.log("Received report submission:", JSON.stringify(req.body, null, 2));
    
    // Validate required fields
    if (!req.body.user || !req.body.exam) {
      console.log("VALIDATION ERROR: Missing user or exam ID");
      return res.status(400).send({
        message: "User ID and Exam ID are required",
        success: false,
      });
    }
    
    // Check if result object exists and has required properties
    if (!req.body.result || typeof req.body.result !== 'object') {
      console.log("VALIDATION ERROR: Missing or invalid result object");
      return res.status(400).send({
        message: "Result object is required",
        success: false,
      });
    }
    
    // Create and save the report
    const newReport = new Report(req.body);
    const savedReport = await newReport.save();
    console.log("✅ Report saved successfully with ID:", savedReport._id);
    
    // Auto-update the leaderboard when a report is created
    try {
      console.log("Starting leaderboard entry creation...");
      
      // Get the exam details for category
      const examInfo = await Exam.findById(req.body.exam);
      
      if (!examInfo) {
        console.log("❌ ERROR: Exam not found for leaderboard update. Exam ID:", req.body.exam);
      } else {
        console.log("✅ Found exam for leaderboard:", examInfo.name, "Category:", examInfo.category);
        
        // Extract and validate result data
        const totalQuestions = req.body.result.totalQuestions || 0;
        const correctAnswers = req.body.result.correctAnswers || 0;
        const score = req.body.result.score || 0;
        const timeTaken = req.body.result.timeTaken || 0;
        const verdict = req.body.result.verdict || "Fail";
        
        console.log("Report details:", {
          totalQuestions,
          correctAnswers,
          score,
          timeTaken,
          verdict
        });
        
        // Calculate accuracy (avoid division by zero)
        const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
        
        // Determine if the exam was passed
        const isPassed = verdict === "Pass";
        
        // Check if an entry already exists for this user and exam
        const existingEntry = await Leaderboard.findOne({
          user: req.body.user,
          exam: req.body.exam
        });
        
        if (existingEntry) {
          console.log("Found existing leaderboard entry for user:", req.body.user);
          console.log("Existing score:", existingEntry.score, "New score:", score);
          
          // Only update if the new score is better
          if (score > existingEntry.score) {
            existingEntry.score = score;
            existingEntry.accuracy = accuracy;
            existingEntry.timeTaken = timeTaken;
            existingEntry.isPassed = isPassed;
            await existingEntry.save();
            console.log("✅ Updated leaderboard entry with higher score:", existingEntry._id);
          } else {
            console.log("Existing score is higher, not updating leaderboard");
          }
        } else {
          // Create a new leaderboard entry
          const leaderboardEntry = new Leaderboard({
            user: req.body.user,
            exam: req.body.exam,
            score: score,
            accuracy: accuracy,
            timeTaken: timeTaken,
            category: examInfo.category || "general",
            isPassed: isPassed
          });
          
          // Log the entry being created
          console.log("Creating new leaderboard entry:", JSON.stringify(leaderboardEntry, null, 2));
          
          // Save the entry to the leaderboard collection
          const savedEntry = await leaderboardEntry.save();
          console.log("✅ New leaderboard entry created with ID:", savedEntry._id);
          
          // Double-check the entry was saved
          const verifyEntry = await Leaderboard.findById(savedEntry._id);
          if (verifyEntry) {
            console.log("✅ Verified leaderboard entry exists in database");
          } else {
            console.log("❌ WARNING: Could not verify leaderboard entry in database!");
          }
        }
        
        // Update rankings in the background
        console.log("Updating rankings for category:", examInfo.category);
        updateRankings(examInfo.category);
      }
    } catch (leaderboardError) {
      // Don't fail the report save if leaderboard update fails
      console.error("❌ ERROR updating leaderboard:", leaderboardError);
    }
    
    // Update user's score in the user model
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.body.user,
        { $inc: { score: req.body.result.score || 0 } },
        { new: true }
      );
      
      console.log("✅ Updated user score. New total:", updatedUser.score);
    } catch (userUpdateError) {
      console.error("❌ ERROR updating user score:", userUpdateError);
    }
    
    // Count leaderboard entries
    try {
      const leaderboardCount = await Leaderboard.countDocuments();
      console.log("📊 Total leaderboard entries in database:", leaderboardCount);
    } catch (countError) {
      console.error("Error counting leaderboard entries:", countError);
    }
    
    console.log("===================== REPORT SUBMISSION COMPLETE =====================");
    
    res.send({
      message: "Attempt added successfully",
      success: true,
    });
  } catch (error) {
    console.error("❌ ERROR in add-report:", error);
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

// Helper function to update rankings in the background
async function updateRankings(category) {
  try {
    // Get all users sorted by score
    const usersRanked = await Leaderboard.aggregate([
      { $match: category ? { category } : {} },
      {
        $group: {
          _id: "$user",
          totalScore: { $sum: "$score" }
        }
      },
      { $sort: { totalScore: -1 } }
    ]);
    
    // Update rank for each leaderboard entry
    for (let i = 0; i < usersRanked.length; i++) {
      await Leaderboard.updateMany(
        { user: usersRanked[i]._id, ...(category ? { category } : {}) },
        { $set: { rank: i + 1 } }
      );
    }
    
    console.log("✅ Rankings updated successfully");
  } catch (error) {
    console.error("❌ ERROR updating rankings:", error);
  }
}

// get all reports

router.post("/get-all-reports", authMiddleware, async (req, res) => {
  try {
    const { examName, userName } = req.body;

    const exams = await Exam.find({
      name: {
        $regex: examName,
      },
    });

    const matchedExamIds = exams.map((exam) => exam._id);

    const users = await User.find({
      name: {
        $regex: userName,
      },
    });

    const matchedUserIds = users.map((user) => user._id);

    const reports = await Report.find({
      exam: {
        $in: matchedExamIds,
      },
      user: {
        $in: matchedUserIds,
      },
    })
      .populate("exam")
      .populate("user")
      .sort({ createdAt: -1 });
    res.send({
      message: "Attempts fetched successfully",
      data: reports,
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

// get all reports by user
router.post("/get-all-reports-by-user", authMiddleware, async (req, res) => {
  try {
    const reports = await Report.find({ user: req.body.userId })
      .populate("exam")
      .populate("user")
      .sort({ createdAt: -1 });
    res.send({
      message: "Attempts fetched successfully",
      data: reports,
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

module.exports = router;
