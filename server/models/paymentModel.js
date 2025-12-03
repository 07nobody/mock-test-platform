const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "exams",
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["credit_card", "debit_card", "netbanking", "upi", "wallet", "free_test"]
    },
    transactionId: {
      type: String,
      unique: true
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending"
    },
    paymentProvider: {
      type: String,
      required: false
    },
    paymentDetails: {
      type: Object,
      required: false
    },
    receiptNumber: {
      type: String,
      unique: true,
      default: function() {
        return "REC" + Math.floor(100000 + Math.random() * 900000).toString();
      }
    },
    validUntil: {
      type: Date,
      default: function() {
        // By default, access is valid for 30 days from payment
        const now = new Date();
        now.setDate(now.getDate() + 30);
        return now;
      }
    },
    discount: {
      type: Number,
      default: 0
    },
    couponCode: {
      type: String
    },
    notes: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Index for faster lookups
paymentSchema.index({ userId: 1, examId: 1 });
paymentSchema.index({ status: 1 });

const Payment = mongoose.model("payments", paymentSchema);
module.exports = Payment;