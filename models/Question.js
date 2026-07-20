
const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  déclaration : { type: String, required: true },
  datCreate: Date,
  type : {
    type : String,
    enum: ["QCM", "VraiFaux", "RéponseCourte"],
    required: true,
  },
  points: { type: Number, default: 1 },
  ordre: { type: Number, default: 0 },
});

module.exports = mongoose.model("Question", questionSchema);