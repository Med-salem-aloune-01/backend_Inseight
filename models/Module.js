
const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema(
  {
    titr: { type: String, required: true, trim: true },
    description: {type: String},
    ordre: { type: Number, default: 0 },
    datCreate : Date,
    cour: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("Module", moduleSchema);