
const mongoose = require("mongoose");
const User = require("User");

const teacherSchema = new mongoose.Schema({
  role: { type: 'enseignant'},
  spécialité:{type: String},
  bureau: {type: String},
});

module.exports = User.discriminator("Enseignant", enseignantSchema);