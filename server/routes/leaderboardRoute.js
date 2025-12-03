const router = require("express").Router();
const Leaderboard = require("../models/leaderboardModel");
const User = require("../models/userModel");
const Exam = require("../models/examModel");
const authMiddleware = require("../middlewares/authMiddleware");

// Calculate weighted score for leaderboard rank
router.get("/get-leaderboard", authMiddleware, async (req, res) => {
  try {
    console.log("GET /leaderboard/get-leaderboard - Request received");
    
    // Extract query parameters for filtering
    const { period, category, examId, isAdmin } = req.query;
    console.log("Query parameters:", { period, category, examId, isAdmin });
    
    // Build the match criteria for aggregation
    const matchCriteria = {};
    
    // Filter by time period if specified
    if (period && period !== 'all-time' && period !== 'all') {
      const currentDate = new Date();
      let startDate;
      
      switch (period) {
        case 'weekly':
        case 'week':
          // Last 7 days
          startDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
        case 'month':
          // Last 30 days
          startDate = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'yearly':
        case 'year':
          // Last 365 days
          startDate = new Date(currentDate.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          // No time filter (all time)
          startDate = null;
      }
      
      if (startDate) {
        matchCriteria.createdAt = { $gte: startDate };
      }
    }
    
    // Filter by category if specified
    if (category && category !== 'all') {
      matchCriteria.category = category;
    }
    
    // Filter by exam if specified
    if (examId && examId !== 'all') {
      matchCriteria.exam = examId;
    }
    
    console.log("Leaderboard Match Criteria:", matchCriteria);
    
    // First, check if there are any leaderboard entries at all
    const totalEntries = await Leaderboard.countDocuments();
    console.log("Total leaderboard entries found:", totalEntries);
    
    if (totalEntries === 0) {
      console.log("No leaderboard entries found in the database");
      return res.status(200).send({
        success: true,
        message: "No leaderboard data available yet",
        data: [],
        categories: []
      });
    }
    
    // Fetch exam details to get difficulty levels for score weighting
    const exams = await Exam.find({}).select('_id name difficulty category');
    const examDifficultyMap = {};
    
    // Create a map of exam IDs to their difficulty levels
    exams.forEach(exam => {
      let difficultyWeight = 1.0; // Default weight
      
      // Assign difficulty weights
      switch (exam.difficulty) {
        case 'easy':
          difficultyWeight = 1.0;
          break;
        case 'medium':
          difficultyWeight = 1.5;
          break;
        case 'hard':
          difficultyWeight = 2.0;
          break;
        case 'expert':
          difficultyWeight = 2.5;
          break;
        default:
          difficultyWeight = 1.0;
      }
      
      examDifficultyMap[exam._id.toString()] = {
        difficulty: exam.difficulty,
        weight: difficultyWeight,
        name: exam.name,
        category: exam.category
      };
    });
    
    // Aggregate leaderboard data
    const leaderboardData = await Leaderboard.aggregate([
      // Match documents based on criteria
      { $match: matchCriteria },
      
      // Lookup exam details
      {
        $lookup: {
          from: "exams",
          localField: "exam",
          foreignField: "_id",
          as: "examDetails"
        }
      },
      
      // Unwind the exam details array
      {
        $unwind: {
          path: "$examDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      
      // Add weighted score based on difficulty and accuracy
      {
        $addFields: {
          // Calculate weighted score based on difficulty and accuracy
          weightedScore: {
            $multiply: [
              "$score",
              {
                $cond: [
                  { $ifNull: ["$examDetails.difficulty", false] },
                  {
                    $switch: {
                      branches: [
                        { case: { $eq: ["$examDetails.difficulty", "easy"] }, then: 1.0 },
                        { case: { $eq: ["$examDetails.difficulty", "medium"] }, then: 1.5 },
                        { case: { $eq: ["$examDetails.difficulty", "hard"] }, then: 2.0 },
                        { case: { $eq: ["$examDetails.difficulty", "expert"] }, then: 2.5 }
                      ],
                      default: 1.0
                    }
                  },
                  1.0 // Default weight if exam details not found
                ]
              },
              // Apply a bonus for high accuracy
              {
                $cond: [
                  { $gte: ["$accuracy", 90] },
                  1.2, // 20% bonus for accuracy ≥ 90%
                  {
                    $cond: [
                      { $gte: ["$accuracy", 80] },
                      1.1, // 10% bonus for accuracy ≥ 80%
                      1.0  // No bonus for accuracy < 80%
                    ]
                  }
                ]
              },
              // Apply recency factor - more recent attempts get more weight
              {
                $cond: [
                  { $gte: ["$createdAt", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] },
                  1.1, // 10% bonus for attempts in the last 30 days
                  1.0
                ]
              }
            ]
          }
        }
      },
      
      // Group by user to calculate total score, exam count, etc.
      {
        $group: {
          _id: "$user",
          rawScore: { $sum: "$score" }, // Original unweighted total score
          totalScore: { $sum: "$weightedScore" }, // Weighted score for ranking
          examsCompleted: { $count: {} },
          averageScore: { $avg: "$score" },
          highestScore: { $max: "$score" },
          passedExams: { 
            $sum: { $cond: [{ $eq: ["$isPassed", true] }, 1, 0] } 
          },
          totalTimeTaken: { $sum: "$timeTaken" },
          lastAttemptDate: { $max: "$createdAt" },
          examCategories: { $addToSet: "$examDetails.category" },
          // Store difficulty distribution for achievements
          easyExams: { 
            $sum: { $cond: [{ $eq: ["$examDetails.difficulty", "easy"] }, 1, 0] } 
          },
          mediumExams: { 
            $sum: { $cond: [{ $eq: ["$examDetails.difficulty", "medium"] }, 1, 0] } 
          },
          hardExams: { 
            $sum: { $cond: [{ $eq: ["$examDetails.difficulty", "hard"] }, 1, 0] } 
          },
          expertExams: { 
            $sum: { $cond: [{ $eq: ["$examDetails.difficulty", "expert"] }, 1, 0] } 
          }
        }
      },
      
      // Calculate pass rate (handle division by zero)
      {
        $addFields: {
          passRate: { 
            $cond: [
              { $eq: ["$examsCompleted", 0] },
              0,
              {
                $multiply: [
                  { $divide: ["$passedExams", "$examsCompleted"] },
                  100
                ]
              }
            ]
          },
          // Add a performance index for display (combines multiple factors)
          performanceIndex: {
            $round: [
              {
                $multiply: [
                  // Base on weighted score
                  { $divide: ["$totalScore", { $max: [1, "$examsCompleted"] }] },
                  // Bonus for consistency (pass rate)
                  {
                    $add: [
                      0.8,
                      {
                        $multiply: [
                          0.004, // Max 0.4 (40% of base weight)
                          { 
                            $cond: [
                              { $eq: ["$examsCompleted", 0] },
                              0,
                              { $divide: ["$passedExams", "$examsCompleted"] }
                            ]
                          },
                          100
                        ]
                      }
                    ]
                  }
                ]
              },
              1
            ]
          },
          // Calculate time efficiency (lower is better)
          timeEfficiency: {
            $cond: [
              { $eq: ["$examsCompleted", 0] },
              0,
              {
                $divide: [
                  "$totalTimeTaken",
                  "$examsCompleted"
                ]
              }
            ]
          }
        }
      },
      
      // Lookup user details
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      
      // Unwind the user details array
      { $unwind: "$userDetails" },
      
      // Project final output fields
      {
        $project: {
          _id: 1,
          name: "$userDetails.name",
          email: "$userDetails.email",
          // Remove complex score logic and focus on more meaningful metrics
          examsCompleted: 1,
          examsPassed: "$passedExams",
          highestScore: 1,
          averageScore: { $round: ["$averageScore", 1] },
          passRate: { $round: ["$passRate", 1] },
          performanceIndex: { 
            $round: [
              {
                $multiply: [
                  "$averageScore",
                  {
                    $add: [
                      0.5,
                      { 
                        $multiply: [
                          0.5,
                          {
                            $cond: [
                              { $eq: ["$examsCompleted", 0] },
                              0,
                              { $divide: ["$passedExams", "$examsCompleted"] }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              0
            ]
          },
          // Include category breakdown for added context
          examCategories: 1,
          difficultyBreakdown: {
            easy: "$easyExams",
            medium: "$mediumExams",
            hard: "$hardExams",
            expert: "$expertExams"
          }
        }
      },
      
      // Sort by performance index (clearer measure of overall achievement)
      { $sort: { performanceIndex: -1 } }
    ]);
    
    console.log("Aggregation results:", JSON.stringify(leaderboardData.slice(0, 2), null, 2));
    
    // Fetch available categories for the filter
    const categories = await Leaderboard.distinct("category");
    console.log("Available categories:", categories);
    
    // Add rank position to each user
    const rankedData = leaderboardData.map((user, index) => ({
      ...user,
      rank: index + 1
    }));
    
    console.log("Sending leaderboard data with", rankedData.length, "entries");
    
    res.status(200).send({
      success: true,
      message: "Leaderboard data retrieved successfully",
      data: rankedData,
      categories
    });
  } catch (error) {
    console.error("Error in get-leaderboard API:", error);
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

// Get leaderboard stats for a specific user
router.get("/user-stats", authMiddleware, async (req, res) => {
  try {
    // Get user ID from query parameter or from auth middleware
    let userId = req.query.userId;
    
    // If no userId provided in query, use the authenticated user's ID
    if (!userId) {
      userId = req.userId;
    }
    
    if (!userId) {
      return res.status(400).send({
        success: false,
        message: "User ID is required"
      });
    }
    
    console.log("Fetching stats for user:", userId);
    
    // Get user's leaderboard entries
    const entries = await Leaderboard.find({ user: userId })
      .populate("exam", "name duration category")
      .sort({ createdAt: -1 });
    
    if (entries.length === 0) {
      return res.status(200).send({
        success: true,
        message: "No leaderboard entries found for this user",
        data: {
          totalScore: 0,
          examsCompleted: 0,
          averageScore: 0,
          passRate: 0,
          recentEntries: []
        }
      });
    }
    
    // Calculate user statistics
    const totalScore = entries.reduce((sum, entry) => sum + entry.score, 0);
    const examsCompleted = entries.length;
    const averageScore = totalScore / examsCompleted;
    const passedExams = entries.filter(entry => entry.isPassed).length;
    const passRate = (passedExams / examsCompleted) * 100;
    
    // Get user's rank
    const allUserScores = await Leaderboard.aggregate([
      {
        $group: {
          _id: "$user",
          totalScore: { $sum: "$score" }
        }
      },
      { $sort: { totalScore: -1 } }
    ]);
    
    const userRankIndex = allUserScores.findIndex(item => item._id.toString() === userId.toString());
    const rank = userRankIndex !== -1 ? userRankIndex + 1 : null;
    
    // Get recent entries (last 5)
    const recentEntries = entries.slice(0, 5).map(entry => ({
      _id: entry._id,
      examName: entry.exam.name,
      category: entry.exam.category,
      score: entry.score,
      date: entry.createdAt,
      isPassed: entry.isPassed
    }));
    
    // Get performance by category
    const categoriesMap = {};
    entries.forEach(entry => {
      const category = entry.exam.category || "Uncategorized";
      if (!categoriesMap[category]) {
        categoriesMap[category] = {
          totalScore: 0,
          count: 0,
          passed: 0
        };
      }
      categoriesMap[category].totalScore += entry.score;
      categoriesMap[category].count += 1;
      if (entry.isPassed) {
        categoriesMap[category].passed += 1;
      }
    });
    
    const categoryPerformance = Object.keys(categoriesMap).map(category => ({
      category,
      averageScore: Math.round(categoriesMap[category].totalScore / categoriesMap[category].count),
      examCount: categoriesMap[category].count,
      passRate: Math.round((categoriesMap[category].passed / categoriesMap[category].count) * 100)
    }));
    
    // Sort by average score
    categoryPerformance.sort((a, b) => b.averageScore - a.averageScore);
    
    res.status(200).send({
      success: true,
      message: "User statistics retrieved successfully",
      data: {
        rank,
        totalScore,
        examsCompleted,
        averageScore: Math.round(averageScore),
        passRate: Math.round(passRate),
        recentEntries,
        categoryPerformance
      }
    });
  } catch (error) {
    console.error("Error in user-stats API:", error);
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

// Get admin dashboard stats
router.get("/admin-stats", authMiddleware, async (req, res) => {
  try {
    // Check if the user is an admin - get from query or auth middleware
    const isAdmin = req.query.isAdmin === 'true' || req.body.isAdmin;
    
    if (!isAdmin) {
      return res.status(403).send({
        success: false,
        message: "Unauthorized: Admin access required"
      });
    }
    
    // Get total number of entries in the leaderboard
    const totalEntries = await Leaderboard.countDocuments();
    
    // Get total number of unique users in the leaderboard
    const uniqueUsers = await Leaderboard.distinct("user");
    const userCount = uniqueUsers.length;
    
    // Get total number of unique exams in the leaderboard
    const uniqueExams = await Leaderboard.distinct("exam");
    const examCount = uniqueExams.length;
    
    // Get average score across all entries
    const scoreData = await Leaderboard.aggregate([
      {
        $group: {
          _id: null,
          averageScore: { $avg: "$score" },
          highestScore: { $max: "$score" },
          lowestScore: { $min: "$score" }
        }
      }
    ]);
    
    const averageScore = scoreData.length > 0 ? Math.round(scoreData[0].averageScore) : 0;
    const highestScore = scoreData.length > 0 ? scoreData[0].highestScore : 0;
    const lowestScore = scoreData.length > 0 ? scoreData[0].lowestScore : 0;
    
    // Get pass rate across all entries
    const passData = await Leaderboard.aggregate([
      {
        $group: {
          _id: null,
          passCount: { 
            $sum: { $cond: [{ $eq: ["$isPassed", true] }, 1, 0] } 
          },
          totalCount: { $sum: 1 }
        }
      }
    ]);
    
    const passRate = passData.length > 0 
      ? Math.round((passData[0].passCount / passData[0].totalCount) * 100) 
      : 0;
    
    // Get top performing categories
    const categoryPerformance = await Leaderboard.aggregate([
      {
        $group: {
          _id: "$category",
          averageScore: { $avg: "$score" },
          examCount: { $sum: 1 },
          passCount: { 
            $sum: { $cond: [{ $eq: ["$isPassed", true] }, 1, 0] } 
          }
        }
      },
      {
        $project: {
          category: "$_id",
          averageScore: { $round: ["$averageScore", 1] },
          examCount: 1,
          passRate: { 
            $round: [
              { $multiply: [{ $divide: ["$passCount", "$examCount"] }, 100] },
              1
            ]
          }
        }
      },
      { $sort: { averageScore: -1 } }
    ]);
    
    // Monthly trend data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyTrend = await Leaderboard.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          averageScore: { $avg: "$score" },
          examCount: { $sum: 1 },
          userCount: { $addToSet: "$user" }
        }
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              { $toString: "$_id.month" }
            ]
          },
          averageScore: { $round: ["$averageScore", 1] },
          examCount: 1,
          userCount: { $size: "$userCount" }
        }
      },
      { $sort: { month: 1 } }
    ]);
    
    res.status(200).send({
      success: true,
      message: "Admin statistics retrieved successfully",
      data: {
        totalEntries,
        userCount,
        examCount,
        averageScore,
        highestScore,
        lowestScore,
        passRate,
        categoryPerformance,
        monthlyTrend
      }
    });
  } catch (error) {
    console.error("Error in admin-stats API:", error);
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;