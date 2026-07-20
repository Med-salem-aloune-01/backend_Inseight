
const mongoose = require("mongoose");

const choiceSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
  text: { type: String, required: true },
  estCorrect: { type: Boolean, default: false },
  ordre: { type: Number, default: 0 },
});

module.exports = mongoose.model("Choix", choiceSchema);