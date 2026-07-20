
const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    titre: { type: String, required: true, trim: true },
    description: String, 
  },
  { timestamps: true }
);

module.exports = mongoose.model("Matiere", matiereSchema);