import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  duration: { type: Number },
  level: { type: String },
  image: { type: String }
}, { timestamps: true });

export const Course = mongoose.model('Course', courseSchema);

const inscriptionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  enrolledAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'completed', 'dropped'], default: 'active' }
}, { timestamps: true });

inscriptionSchema.index({ student: 1, course: 1 }, { unique: true });

export const Inscription = mongoose.model('Inscription', inscriptionSchema);