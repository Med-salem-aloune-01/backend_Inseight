
const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    titre: String,
    description: String,
    niveau: String,
    categorie: String,
    image: String,

  },
  { timestamps: true }
);

module.exports = mongoose.model("Cours", courseSchema);