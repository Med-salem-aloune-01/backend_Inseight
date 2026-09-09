import { QuizAttempt } from '../models/QuizAttempt.js';
import { Inscription } from '../models/Course.js';
import { PerformanceMetric, DashboardData } from '../models/PerformanceMetric.js';
import {Course} from "../models/Course.js";
export const generateForStudent = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const attempts = await QuizAttempt.find({ student: studentId }).sort({ createdAt: 1 });
    const enrollments = await Inscription.find({ student: studentId });

    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter((e) => e.status === 'completed').length;
    const averageScore = attempts.reduce((acc, curr) => acc + curr.score, 0) / (attempts.length || 1);

    // Courbe : score de chaque tentative, dans l'ordre chronologique
    const progress = attempts.map((a) => ({
      date: a.createdAt.toISOString().slice(0, 10), // "YYYY-MM-DD"
      score: a.score,
    }));

    const dashboard = await DashboardData.findOneAndUpdate(
      { user: studentId },
      { user: studentId, totalCourses, completedCourses, averageScore },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      data: { ...dashboard.toObject(), progress },
    });
  } catch (error) { next(error); }
};

export const generateForTeacher = async (req, res, next) => {
  try {
    const metrics = await PerformanceMetric.find({ course: req.params.courseId });
    res.status(200).json({ success: true, data: metrics });
  } catch (error) { next(error); }
};


import { User } from '../models/User.js';
import { Quiz } from '../models/Quiz.js';


export const generateForAdmin = async (req, res, next) => {
  try {
    const totalStudents = await Inscription.countDocuments();
    const totalquiz= await Quiz.countDocuments();
    
    const growthAgg = await User.aggregate([
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    let running = 0;
    const platformGrowth = growthAgg.map((g) => {
      running += g.count;
      return { month: monthNames[g._id.month - 1], users: running };
    });

    const distAgg = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);
    const userDistribution = distAgg.map((d) => ({ name: d._id, value: d.count }));

    const attempts = await QuizAttempt.find({}, 'score');
    const gradeBuckets = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    attempts.forEach(({ score }) => {
      if (score >= 90) gradeBuckets.A++;
      else if (score >= 80) gradeBuckets.B++;
      else if (score >= 70) gradeBuckets.C++;
      else if (score >= 60) gradeBuckets.D++;
      else gradeBuckets.F++;
    });
    const gradeDistribution = Object.entries(gradeBuckets).map(([grade, count]) => ({ grade, count }));

    const completionAgg = await Inscription.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const statusLabels = { completed: 'Completed', in_progress: 'In Progress', not_started: 'Not Started' };
    const courseCompletion = completionAgg.map((c) => ({
      name: statusLabels[c._id] || c._id,
      value: c.count,
    }));

    const avgQuizScore = attempts.length
      ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
      : 0;
    const completedCount = completionAgg.find((c) => c._id === 'completed')?.count || 0;
    const completionRate = totalStudents ? Math.round((completedCount / totalStudents) * 100) : 0;
    const activeStudents = await User.countDocuments({ role: 'student', isActive: true });
    const totalCourses = await Inscription.distinct('course').then((  c) => c.length);
    const activeCourses = await Course.countDocuments();
    res.status(200).json({
      success: true,
      data: {
        kpis: { completionRate, avgQuizScore, activeStudents, totalCourses, totalquiz,totalStudents,activeCourses },
        platformGrowth,
        userDistribution,
        gradeDistribution,
        courseCompletion,
        
      },
    });
  } catch (error) { next(error); }
};
