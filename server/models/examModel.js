const mongoose = require("mongoose");
const examSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    passingMarks: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "active",
      enum: ["active", "inactive"],
    },
    examCode: {
      type: String,
      default: function() {
        // Generate a 6-character code with letters and numbers - only runs at document creation
        return Math.random().toString(36).substring(2, 8).toUpperCase();
      }
    },
    isPaid: {
      type: mongoose.Schema.Types.Mixed, // Changed from Boolean to Mixed to support both boolean and object formats
      default: false,
    },
    price: {
      type: Number,
      default: 0,
    },
    registeredUsers: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
      email: String,
      registeredAt: {
        type: Date,
        default: Date.now,
      },
      paymentStatus: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending",
      }
    }],
    questions: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "questions",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Exam = mongoose.model("exams", examSchema);
module.exports = Exam;
