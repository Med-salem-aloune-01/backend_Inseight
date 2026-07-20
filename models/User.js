
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nom: {type: String},
  prenom: {type: String},
  email: { type: String, unique: true },
  mdp: {type: String},
  role: { type: String, enum: ['admin', 'user', 'enseignant'], default: 'user' },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
