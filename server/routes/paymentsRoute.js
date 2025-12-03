const router = require("express").Router();
const Payment = require("../models/paymentModel");
const Exam = require("../models/examModel");
const User = require("../models/userModel");
const authMiddleware = require("../middlewares/authMiddleware");
const { sendPaymentReceipt } = require("../services/emailService");

// Create a new payment intent for an exam
router.post("/create-payment", authMiddleware, async (req, res) => {
  try {
    const { examId, userId, amount, paymentMethod, transactionId, paymentDetails } = req.body;
    
    // Find the exam to get the price
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).send({
        message: "Exam not found",
        success: false,
      });
    }
    
    // Check if exam is paid
    if (!exam.isPaid) {
      return res.status(400).send({
        message: "This exam doesn't require payment",
        success: false,
      });
    }
    
    // Check if user is already registered for this exam
    const alreadyRegistered = exam.registeredUsers.find(
      (user) => user.userId.toString() === userId
    );
    
    if (alreadyRegistered && alreadyRegistered.paymentStatus === "completed") {
      return res.status(400).send({
        message: "You have already paid for this exam",
        success: false,
      });
    }
    
    // Check if a payment is already in progress
    const existingPayment = await Payment.findOne({
      examId,
      userId,
      status: "pending"
    });
    
    if (existingPayment) {
      return res.status(200).send({
        message: "Payment already initiated",
        success: true,
        data: {
          paymentId: existingPayment._id,
          transactionId: existingPayment.transactionId,
          amount: existingPayment.amount,
        }
      });
    }
    
    // Create payment record
    const payment = new Payment({
      examId,
      userId,
      amount: exam.isPaid.price || 0,
      paymentMethod,
      transactionId,
      status: "pending",
      paymentDetails
    });
    
    await payment.save();
    
    // In a real app, this would integrate with a payment gateway
    
    res.status(200).send({
      message: "Payment initiated successfully",
      success: true,
      data: {
        paymentId: payment._id, // Include the payment ID in the response
        transactionId,
        amount: payment.amount,
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

// Complete a payment
router.post("/complete-payment", authMiddleware, async (req, res) => {
  try {
    const { examId, userId, transactionId, status, paymentId } = req.body;
    
    // First, try to find payment by payment ID if provided
    let payment;
    if (paymentId) {
      payment = await Payment.findById(paymentId);
    }
    
    // If not found by ID, try the transaction ID
    if (!payment) {
      payment = await Payment.findOne({ 
        transactionId,
        examId,
        userId
      });
    }
    
    if (!payment) {
      console.log("Payment not found. Search criteria:", { examId, userId, transactionId, paymentId });
      
      // Check how many payments exist for this user/exam
      const allUserPayments = await Payment.find({ 
        userId, 
        examId
      });
      
      console.log(`Found ${allUserPayments.length} payments for this user/exam`);
      
      return res.status(404).send({
        message: "Payment record not found. Please try again or contact support.",
        success: false,
      });
    }
    
    console.log("Found payment record:", payment);
    
    // Update payment status
    payment.status = status || "completed";
    await payment.save();
    
    // Update user registration status in exam
    const exam = await Exam.findById(payment.examId);
    if (!exam) {
      return res.status(404).send({
        message: "Exam not found",
        success: false,
      });
    }
    
    // Find user in registered users
    const userIndex = exam.registeredUsers.findIndex(
      (user) => user.userId.toString() === payment.userId.toString()
    );
    
    if (userIndex >= 0) {
      // Update existing registration
      exam.registeredUsers[userIndex].paymentStatus = "completed";
    } else {
      // Add new registration (this should not happen normally)
      exam.registeredUsers.push({
        userId: payment.userId,
        paymentStatus: "completed"
      });
    }
    
    await exam.save();
    
    // Send payment receipt email to user and admin
    try {
      const user = await User.findById(payment.userId);
      if (user) {
        await sendPaymentReceipt(payment, exam, user);
      }
    } catch (error) {
      console.error("Error in email sending process:", error);
      // Continue with the payment process even if email fails
    }
    
    res.status(200).send({
      message: "Payment completed successfully",
      success: true,
      data: {
        receiptNumber: payment.receiptNumber,
        examCode: exam.examCode
      }
    });
    
  } catch (error) {
    console.error("Error completing payment:", error);
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

// Get all payments for a user
router.post("/get-user-payments", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    
    const payments = await Payment.find({ userId })
      .populate("examId", "name category")
      .sort({ createdAt: -1 });
    
    res.status(200).send({
      message: "Payments fetched successfully",
      success: true,
      data: payments
    });
    
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

// Check payment status for an exam
router.post("/check-payment", authMiddleware, async (req, res) => {
  try {
    const { userId, examId } = req.body;
    
    // Find the exam
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
    
    if (!userRegistration) {
      return res.status(200).send({
        message: "User not registered for this exam",
        success: true,
        data: null
      });
    }
    
    // Find the latest payment
    const payment = await Payment.findOne({
      examId,
      userId,
      status: "completed"
    }).sort({ createdAt: -1 });
    
    res.status(200).send({
      message: "Payment status fetched successfully",
      success: true,
      data: {
        isRegistered: true,
        paymentStatus: userRegistration.paymentStatus,
        paymentDetails: payment || null
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

// Get all payments (admin only)
router.post("/get-all-payments", authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.body.userId);
    if (!user.isAdmin) {
      return res.status(403).send({
        message: "You are not authorized to access this resource",
        success: false,
      });
    }
    
    const { userName, examName, startDate, endDate } = req.body;
    let query = {};
    
    // Build query pipeline
    let paymentQuery = Payment.find(query)
      .populate({
        path: "userId",
        select: "name email" // Only include non-sensitive info
      })
      .populate({
        path: "examId",
        select: "name category"
      })
      .sort({ createdAt: -1 });
    
    // Apply filters if provided
    if (startDate && endDate) {
      paymentQuery = paymentQuery.where('createdAt').gte(new Date(startDate)).lte(new Date(endDate));
    }
    
    const payments = await paymentQuery;
    
    // Filter by user name if provided
    let filteredPayments = payments;
    if (userName) {
      filteredPayments = filteredPayments.filter(payment => 
        payment.userId && payment.userId.name.toLowerCase().includes(userName.toLowerCase())
      );
    }
    
    // Filter by exam name if provided
    if (examName) {
      filteredPayments = filteredPayments.filter(payment => 
        payment.examId && payment.examId.name.toLowerCase().includes(examName.toLowerCase())
      );
    }
    
    res.status(200).send({
      message: "Payments fetched successfully",
      success: true,
      data: filteredPayments
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