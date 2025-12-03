const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  correctOption: {
    type: String,
    required: true,
  },
  options: {
    type: Object,
    required: true,
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "exams",
  },
  tags: {
    type: [String],
    default: []
  },
  category: {
    type: String,
    default: "General"
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Medium"
  }
}, {
    timestamps: true,
});

const Question = mongoose.model("questions", questionSchema);
module.exports = Question;
