
const mongoose = require("mongoose");
const User = require("User");

const adminSchema = new mongoose.Schema({
    role: { type: 'admin'},
    autorisations: [{ type: String }],
});

module.exports = User.discriminator("Admin", adminSchema);