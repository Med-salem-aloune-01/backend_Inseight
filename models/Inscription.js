
const mongoose = require("mongoose");

const inscriptionSchema = new mongoose.Schema({
  etudiant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cours: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  DatInscrit: { type: Date, default: Date.now },
  statut : {
    type : String,
    enum: ["activé", "complété", "abandonné"],
    default: "active",
  },
});

module.exports = mongoose.model("Inscription", inscriptionSchema);