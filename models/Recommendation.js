// models/Recommendation.js
const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema(
  {
    etudiant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    type: String,
  },
  { timestamps: true } 
);


module.exports = mongoose.model("Recommendation", recommendationSchema);