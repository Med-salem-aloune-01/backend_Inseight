import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  description: { type: String },
  duration: { type: Number }, // En minutes
  passingScore: { type: Number, default: 50 },
  isPublished: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const Quiz = mongoose.model('Quiz', quizSchema);

const questionSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  statement: { type: String, required: true },
  type: { type: String, enum: ['MCQ', 'TrueFalse', 'ShortAnswer'], required: true },
  points: { type: Number, default: 1 },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export const Question = mongoose.model('Question', questionSchema);

const choiceSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  text: { type: String, required: true },
  isCorrect: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
});

export const Choice = mongoose.model('Choice', choiceSchema);