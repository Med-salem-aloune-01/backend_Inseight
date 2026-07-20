const mongoose = require("mongoose");

 
const answerSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
  choix: { type: mongoose.Schema.Types.ObjectId, ref: "Choix" },
  RéponseTextue : String,
  estCorrect: { type: Boolean, default: false },
  pointsGag: { type: Number, default: 0 },
});
module.exports = mongoose.model("Reponse", ReponseSchema);