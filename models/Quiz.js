
const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    cours: { type: mongoose.Schema.Types.ObjectId, ref: "Cours", required: true },
    titre: { type: String, required: true, trim: true },
    description : {type: String},
    durée: {type: Number},
    Score: {type: Number},
    datCreate: Date,
    estPublié: { type: Boolean, default: false },
    creationpar : { type: mongoose.Schema.Types.ObjectId, ref: "Enseignant", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);