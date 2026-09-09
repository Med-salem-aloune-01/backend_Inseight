import mongoose from 'mongoose';
import crypto from 'crypto';

const certificateSchema = new mongoose.Schema({

  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },

  grade: {
    type: Number,
    required: true
  },

  certificateId: {
    type: String,
    unique: true,
    default: () => crypto.randomUUID()
  },

  issuedAt: {
    type: Date,
    default: Date.now
  }

});

certificateSchema.index({ student: 1, course: 1 }, { unique: true });

export default mongoose.model('Certificate', certificateSchema);