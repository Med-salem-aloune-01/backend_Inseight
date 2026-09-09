import { Course, Inscription } from '../models/Course.js';
import {Lesson,Module } from '../models/Module.js';
import  LessonProgress  from '../models/LessonProgress.js';
import { Student } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { issueCertificateForCompletedCourse } from './certificateController.js';
export const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours introuvable'
      });
    }

   
    if (req.user) {
      const inscription = await Inscription.findOne({
        student: req.user.id,
        course: course._id,
        status: { $ne: 'completed' }
      });

      if (inscription) {
        const modules = await Module.find({ course: course._id });
        const moduleIds = modules.map(m => m._id);
        const lessons = await Lesson.find({ module: { $in: moduleIds } });

        if (lessons.length > 0) {
          const completedCount = await LessonProgress.countDocuments({
            student: req.user.id,
            lesson: { $in: lessons.map(l => l._id) },
            completed: true
          });

          if (completedCount === lessons.length) {
            await Inscription.findByIdAndUpdate(
              inscription._id, 
              { status: 'completed' });
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    next(error);
  }
};
export const getmyCourses = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.user?.role === 'teacher') {
      filter.teacher = req.user.id;
    }

    const [courses, total] = await Promise.all([
      Course.find(filter).populate('teacher department').skip(skip).limit(limit),
      Course.countDocuments(filter),
    ]);

    let enrollmentByCourseId = {};
    if (req.user) {
      const inscriptions = await Inscription.find({
        student: req.user.id,
        course: { $in: courses.map((c) => c._id) },
      });
      enrollmentByCourseId = inscriptions.reduce((acc, insc) => {
        acc[insc.course.toString()] = insc.status || 'active';
        return acc;
      }, {});
    }

    const coursesWithStatus = courses.map((c) => {
      const courseObj = c.toObject();
      const key = c._id.toString();
      const isEnrolled = Object.prototype.hasOwnProperty.call(enrollmentByCourseId, key);
      return {
        ...courseObj,
        isEnrolled,
        status: isEnrolled ? enrollmentByCourseId[key] : null,
      };
    });

    res.status(200).json({
      success: true,
      data: coursesWithStatus,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) { next(error); }
};

export const getCourses = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      Course.find().populate('teacher department').skip(skip).limit(limit),
      Course.countDocuments(),
    ]);

    let enrollmentByCourseId = {};
    if (req.user) {
      const inscriptions = await Inscription.find({
        student: req.user.id,
        course: { $in: courses.map((c) => c._id) },
      });
      enrollmentByCourseId = inscriptions.reduce((acc, insc) => {
        acc[insc.course.toString()] = insc.status || 'active';
        return acc;
      }, {});
    }

    const coursesWithStatus = courses.map((c) => {
      const courseObj = c.toObject();
      const key = c._id.toString();
      const isEnrolled = Object.prototype.hasOwnProperty.call(enrollmentByCourseId, key);
      return {
        ...courseObj,
        isEnrolled,
        status: isEnrolled ? enrollmentByCourseId[key] : null,
      };
    });

    res.status(200).json({
      success: true,
      data: coursesWithStatus,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) { next(error); }
};

export const createCourse = async (req, res, next) => {
  try {
    const course = await Course.create({ ...req.body, teacher: req.user.id });
    await course.populate('teacher department');
    console.log('COURSE CREATED:', course._id, '| level:', JSON.stringify(course.level));

    if (course.level) {
      const students = await Student.find({ level: course.level }).select('_id');
      console.log('MATCHING STUDENTS:', students.length, students.map(s => s._id));

      if (students.length) {
        const notifications = students.map(s => ({
          user: s._id,
          title: 'New course available',
          message: `A new course "${course.title}" was added for your level.`,
          type: 'new_course',
        }));
        const result = await Notification.insertMany(notifications);
        console.log('NOTIFICATIONS INSERTED:', result.length);
      }
    } else {
      console.log('NO LEVEL ON COURSE — skipping notifications');
    }

    res.status(201).json({ success: true, data: course });
  } catch (error) {
    console.log('CREATE COURSE ERROR:', error.message);
    next(error);
  }
  
const sample = await Student.find().select('level firstName lastName').limit(10);
console.log(sample);
};

export const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate('teacher department');   
    res.status(200).json({ success: true, data: course });
  } catch (error) { next(error); }
};

export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours introuvable'
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Cours supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

export const enrollCourse = async (req, res, next) => {
  try {
    const inscription = await Inscription.create({ student: req.user.id, course: req.params.id });
    res.status(201).json({ success: true, data: inscription });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Already enrolled in this course" });
    }
    next(error);
  }
};
// ============================================================
// GET MY INSCRIPTIONS
// ============================================================
export const getMyInscriptions = async (req, res, next) => {
  try {

    const inscriptions = await Inscription.find({
      student: req.user.id
    }).populate('course', 'title');

    res.status(200).json({
      success: true,
      message: 'Inscriptions fetched',
      data: { inscriptions }
    });

  } catch (error) {
    next(error);
  }
};
export const creerCours = async (req, res, next) => {
  try {
    const { title, description, duration, level } = req.body;

    // Un teacher ne peut créer un cours que dans SON département,
    // même s'il envoie autre chose dans le body
    const department = req.user.role === 'teacher'
      ? req.user.department
      : req.body.department; // admin garde le libre choix

    if (!department) {
      return res.status(400).json({
        success: false,
        message: "Aucun département associé à ce compte."
      });
    }

    const course = await Course.create({
      title,
      description,
      duration,
      level,
      department,
      teacher: req.user._id
    });

    res.status(201).json({ success: true, message: 'Cours créé', data: course });
  } catch (error) {
    next(error);
  }
};

export const listCourses = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const student = await User.findById(req.user.id).select("level");

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const filter = {
      level: student.level,
    };

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .populate("teacher", "firstName lastName")
        .populate("department", "name")
        .skip(skip)
        .limit(limit),

      Course.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: courses,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    next(error);
  }
};