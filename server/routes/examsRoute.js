const router = require("express").Router();
const Exam = require("../models/examModel");
const authMiddleware = require("../middlewares/authMiddleware");
const Question = require("../models/questionModel");
const { sendExamCodeEmail, sendExamActivationEmail } = require("../services/emailService");

// add exam

router.post("/add", authMiddleware, async (req, res) => {
  try {
    // check if exam already exists
    const examExists = await Exam.findOne({ name: req.body.name });
    if (examExists) {
      return res
        .status(200)
        .send({ message: "Exam already exists", success: false });
    }
    req.body.questions = [];
    const newExam = new Exam(req.body);
    await newExam.save();
    res.send({
      message: "Exam added successfully",
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

// get all exams
router.post("/get-all-exams", authMiddleware, async (req, res) => {
  try {
    const exams = await Exam.find({});
    res.send({
      message: "Exams fetched successfully",
      data: exams,
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

// get exam by id
router.post("/get-exam-by-id", authMiddleware, async (req, res) => {
  try {
    const exam = await Exam.findById(req.body.examId).populate("questions");
    res.send({
      message: "Exam fetched successfully",
      data: exam,
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

// edit exam by id
router.post("/edit-exam-by-id", authMiddleware, async (req, res) => {
  try {
    const examId = req.body.examId;
    const shouldNotifyUsers = req.body.shouldNotifyUsers;
    
    // Find the exam before updating to check status change
    const existingExam = await Exam.findById(examId);
    if (!existingExam) {
      return res.status(404).send({
        message: "Exam not found",
        success: false,
      });
    }

    const previousStatus = existingExam.status;
    const newStatus = req.body.status;
    
    // Make a copy of the req.body without shouldNotifyUsers
    const updateData = { ...req.body };
    delete updateData.shouldNotifyUsers;
    
    // Update the exam
    await Exam.findByIdAndUpdate(examId, updateData);
    
    // If status changed from inactive to active and notification was requested
    if (previousStatus === "inactive" && newStatus === "active" && shouldNotifyUsers) {
      // Refetch the updated exam to get latest registered users
      const updatedExam = await Exam.findById(examId);
      
      // Get all registered users
      const registeredUsers = updatedExam.registeredUsers || [];
      
      if (registeredUsers.length > 0) {
        // Send activation notifications
        const notificationPromises = registeredUsers.map(user => 
          sendExamActivationEmail(user.email, updatedExam.name, updatedExam.examCode)
        );
        
        await Promise.all(notificationPromises);
      }
    }
    
    res.send({
      message: "Exam edited successfully",
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

// delete exam by id
router.post("/delete-exam-by-id", authMiddleware, async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.body.examId);
    res.send({
      message: "Exam deleted successfully",
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

// add question to exam

router.post("/add-question-to-exam", authMiddleware, async (req, res) => {
  try {
    // add question to Questions collection
    const newQuestion = new Question(req.body);
    const question = await newQuestion.save();

    // add question to exam
    const exam = await Exam.findById(req.body.exam);
    exam.questions.push(question._id);
    await exam.save();
    res.send({
      message: "Question added successfully",
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

// edit question in exam
router.post("/edit-question-in-exam", authMiddleware, async (req, res) => {
  try {
    // edit question in Questions collection
    await Question.findByIdAndUpdate(req.body.questionId, req.body);
    res.send({
      message: "Question edited successfully",
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


// delete question in exam
router.post("/delete-question-in-exam", authMiddleware, async (req, res) => {
     try {
        // delete question in Questions collection
        await Question.findByIdAndDelete(req.body.questionId);

        // delete question in exam
        const exam = await Exam.findById(req.body.examId);
        exam.questions = exam.questions.filter(
          (question) => question._id != req.body.questionId
        );
        await exam.save();
        res.send({
          message: "Question deleted successfully",
          success: true,
        });
     } catch (error) {
      
     }
});

// Register user for an exam
router.post("/register-exam", authMiddleware, async (req, res) => {
  try {
    const { examId, userId, email } = req.body;
    const exam = await Exam.findById(examId);
    
    if (!exam) {
      return res.status(404).send({
        message: "Exam not found",
        success: false,
      });
    }

    // Check if user is already registered
    const isRegistered = exam.registeredUsers.some(
      (user) => user.userId.toString() === userId
    );

    if (isRegistered) {
      return res.status(200).send({
        message: "You are already registered for this exam",
        success: true,
        data: { examCode: exam.examCode }
      });
    }

    // Add user to registered users
    exam.registeredUsers.push({
      userId,
      email,
      registeredAt: new Date(),
      paymentStatus: exam.isPaid ? "pending" : "completed"
    });

    await exam.save();

    // Send email with exam code
    await sendExamCodeEmail(email, exam.name, exam.examCode);

    res.status(200).send({
      message: "Successfully registered for the exam. Exam code has been sent to your email.",
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

// Check if user is registered for an exam
router.post("/check-registration", authMiddleware, async (req, res) => {
  try {
    const { examId, userId } = req.body;
    const exam = await Exam.findById(examId);
    
    if (!exam) {
      return res.status(404).send({
        message: "Exam not found",
        success: false,
      });
    }

    // Check if user is registered
    const userRegistration = exam.registeredUsers.find(
      (user) => user.userId.toString() === userId
    );

    if (userRegistration) {
      return res.status(200).send({
        message: "User is registered for this exam",
        success: true,
        data: {
          isRegistered: true,
          paymentStatus: userRegistration.paymentStatus,
          examCode: exam.examCode
        }
      });
    } else {
      return res.status(200).send({
        message: "User is not registered for this exam",
        success: true,
        data: {
          isRegistered: false
        }
      });
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

// Get all question categories
router.post("/question-categories", authMiddleware, async (req, res) => {
  try {
    const categories = await Question.distinct("category");
    res.status(200).send({
      message: "Categories fetched successfully",
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

// Get all question tags
router.post("/question-tags", authMiddleware, async (req, res) => {
  try {
    // This gets all unique tags across all questions
    const tags = await Question.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags" } },
      { $sort: { _id: 1 } }
    ]);
    
    res.status(200).send({
      message: "Tags fetched successfully",
      success: true,
      data: tags.map(tag => tag._id)
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

// Bulk upload questions
router.post("/bulk-upload-questions", authMiddleware, async (req, res) => {
  try {
    const { examId, questions } = req.body;
    
    if (!examId) {
      return res.status(400).send({
        message: "Exam ID is required",
        success: false,
      });
    }
    
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).send({
        message: "Questions array is required and must not be empty",
        success: false,
      });
    }
    
    // Find the exam
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).send({
        message: "Exam not found",
        success: false,
      });
    }
    
    // Validate each question
    const validQuestions = questions.filter(q => 
      q.name && q.correctOption && q.options && 
      typeof q.options === 'object' && Object.keys(q.options).length > 0
    );
    
    if (validQuestions.length === 0) {
      return res.status(400).send({
        message: "No valid questions found in the uploaded data",
        success: false,
      });
    }
    
    // Add examId to each question
    const questionsWithExamId = validQuestions.map(q => ({
      ...q,
      exam: examId
    }));
    
    // Insert all questions
    const insertedQuestions = await Question.insertMany(questionsWithExamId);
    const questionIds = insertedQuestions.map(q => q._id);
    
    // Add questions to exam
    exam.questions.push(...questionIds);
    await exam.save();
    
    res.status(200).send({
      message: `${insertedQuestions.length} questions added successfully`,
      success: true,
      data: {
        totalQuestions: questions.length,
        validQuestions: validQuestions.length,
        insertedQuestions: insertedQuestions.length
      }
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

// Search questions by tags or category
router.post("/search-questions", authMiddleware, async (req, res) => {
  try {
    const { tags, category, difficulty, examId } = req.body;
    
    let query = {};
    
    // Add filters based on provided parameters
    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }
    
    if (category) {
      query.category = category;
    }
    
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    if (examId) {
      query.exam = examId;
    }
    
    const questions = await Question.find(query).populate("exam", "name");
    
    res.status(200).send({
      message: "Questions fetched successfully",
      success: true,
      data: questions
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

// Regenerate exam token
router.post("/regenerate-exam-token", authMiddleware, async (req, res) => {
  try {
    const { examId } = req.body;
    
    if (!examId) {
      return res.status(400).send({
        message: "Exam ID is required",
        success: false,
      });
    }

    // Find the exam
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).send({
        message: "Exam not found",
        success: false,
      });
    }

    // Generate a new token
    const newExamCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Update the exam with the new code
    exam.examCode = newExamCode;
    await exam.save();

    // Notify all registered users about the new code
    const notificationPromises = exam.registeredUsers.map(user => 
      sendExamCodeEmail(user.email, exam.name, newExamCode)
    );
    
    await Promise.all(notificationPromises);

    res.status(200).send({
      message: "Exam token regenerated successfully and notifications sent",
      success: true,
      data: {
        examCode: newExamCode
      }
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

// Resend exam code to user
router.post("/resend-exam-code", authMiddleware, async (req, res) => {
  try {
    const { examId } = req.body;
    const userId = req.body.userId || req.userId;
    
    if (!examId) {
      return res.status(400).send({
        message: "Exam ID is required",
        success: false,
      });
    }

    // Find the exam
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).send({
        message: "Exam not found",
        success: false,
      });
    }

    // Check if user is registered for this exam
    const userRegistration = exam.registeredUsers.find(
      (user) => user.userId.toString() === userId
    );

    if (!userRegistration) {
      return res.status(400).send({
        message: "You are not registered for this exam",
        success: false,
      });
    }

    // Resend the exam code to the user's email
    await sendExamCodeEmail(userRegistration.email, exam.name, exam.examCode);

    res.status(200).send({
      message: "Exam code has been resent to your email",
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

// Notify registered users about exam activation
router.post("/notify-registered-users", authMiddleware, async (req, res) => {
  try {
    const { examId } = req.body;
    
    if (!examId) {
      return res.status(400).send({
        message: "Exam ID is required",
        success: false,
      });
    }

    // Find the exam
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).send({
        message: "Exam not found",
        success: false,
      });
    }

    // Check if the exam is active
    if (exam.status !== "active") {
      return res.status(400).send({
        message: "Cannot send notifications for inactive exams",
        success: false,
      });
    }

    // Get all registered users
    const registeredUsers = exam.registeredUsers || [];
    
    if (registeredUsers.length === 0) {
      return res.status(200).send({
        message: "No registered users to notify",
        success: true,
      });
    }

    // Send activation notifications to all registered users
    const notificationPromises = registeredUsers.map(user => 
      sendExamActivationEmail(user.email, exam.name, exam.examCode)
    );
    
    await Promise.all(notificationPromises);

    res.status(200).send({
      message: `Notifications sent to ${registeredUsers.length} registered users`,
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

// Update exam status (quick toggle)
router.post("/update-exam-status", authMiddleware, async (req, res) => {
  try {
    const { examId, status, shouldNotifyUsers } = req.body;
    
    // Find the exam before updating to check status change
    const existingExam = await Exam.findById(examId);
    if (!existingExam) {
      return res.status(404).send({
        message: "Exam not found",
        success: false,
      });
    }

    // If trying to activate the exam, validate it first
    if (status === "active") {
      // Check if the exam has questions
      if (!existingExam.questions || existingExam.questions.length === 0) {
        return res.status(400).send({
          message: "Cannot activate exam without questions",
          success: false,
        });
      }

      // Check if the exam has the correct number of questions
      if (existingExam.questions.length !== existingExam.totalMarks) {
        return res.status(400).send({
          message: `Number of questions (${existingExam.questions.length}) does not match total marks (${existingExam.totalMarks})`,
          success: false,
        });
      }

      // Check if passing marks are valid
      if (existingExam.passingMarks > existingExam.totalMarks) {
        return res.status(400).send({
          message: "Passing marks cannot be greater than total marks",
          success: false,
        });
      }
    }

    const previousStatus = existingExam.status;
    
    // Update the exam status
    existingExam.status = status;
    await existingExam.save();
    
    // If status changed from inactive to active and notification was requested
    if (previousStatus === "inactive" && status === "active" && shouldNotifyUsers) {
      // Get all registered users
      const registeredUsers = existingExam.registeredUsers || [];
      
      if (registeredUsers.length > 0) {
        // Send activation notifications
        const notificationPromises = registeredUsers.map(user => 
          sendExamActivationEmail(user.email, existingExam.name, existingExam.examCode)
        );
        
        await Promise.all(notificationPromises);
      }
    }
    
    res.send({
      message: `Exam status updated to ${status}`,
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
