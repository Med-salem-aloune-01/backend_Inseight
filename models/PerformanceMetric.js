import mongoose from 'mongoose';

const performanceMetricSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  weekName: { type: String },
  quizScoreAverage: { type: Number, default: 0 },
  attendanceRate: { type: Number, default: 0 }
}, { timestamps: true });

export const PerformanceMetric = mongoose.model('PerformanceMetric', performanceMetricSchema);


const dashboardDataSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  totalCourses: { type: Number, default: 0 },
  completedCourses: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  attendanceRate: { type: Number, default: 0 },
  progress: { type: Number, default: 0 },
  rank: { type: Number }
}, { timestamps: true });

export const DashboardData = mongoose.model('DashboardData', dashboardDataSchema);