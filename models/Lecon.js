
const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    titre : { type: String, required: true, trim: true },
    contenu : { type: String}, 
    videoUrl: { type: String},
    pdfUrl: { type: String},
    ordre: { type: Number, default: 0 },
    module: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("Lecon", leconSchema);