import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  order: { type: Number, default: 0 },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true }
}, { timestamps: true });

export const Module = mongoose.model('Module', moduleSchema);
const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String }, 
  pdfUrl: { type: String },
  videoUrl: { type: String },
  order: { type: Number, default: 0 },
  module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true }
}, { timestamps: true });

export const Lesson = mongoose.model('Lesson', lessonSchema);