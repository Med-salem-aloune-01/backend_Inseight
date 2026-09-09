import LessonProgress from '../models/LessonProgress.js';
import { Lesson, Module } from '../models/Module.js';
import { Inscription } from '../models/Course.js';


export const getCourseProgress = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const courseId = req.params.courseId;


    const modules = await Module.find({
      course: courseId
    });

    const moduleIds = modules.map(module => module._id);

    const lessons = await Lesson.find({
      module: { $in: moduleIds }
    });

    const lessonIds = lessons.map(lesson => lesson._id);

    const progress = await LessonProgress.find({
      student: studentId,
      lesson: { $in: lessonIds },
      completed: true
    });

    const completedLessons = progress.map(
      item => item.lesson.toString()
    );

    const completedCount = completedLessons.length;
    const totalLessons = lessons.length;
    const courseCompleted = totalLessons > 0 && completedCount === totalLessons;

    res.status(200).json({
      success: true,

      data: {
        completedLessons,
        completedCount,
        totalLessons,
        courseCompleted
      }
    });

  } catch (error) {
    next(error);
  }
};


export const completeLesson = async (req, res, next) => {
  try {

    const studentId = req.user.id;
    const lessonId = req.params.lessonId;

    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    const module = await Module.findById(lesson.module);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    const courseId = module.course;

 

    const progress = await LessonProgress.findOneAndUpdate(
      {
        student: studentId,
        lesson: lessonId
      },
      {
        student: studentId,
        lesson: lessonId,
        completed: true,
        completedAt: new Date()
      },
      {
        new: true,
        upsert: true
      }
    );

  

    const modules = await Module.find({
      course: courseId
    });

    const moduleIds = modules.map(module => module._id);



    const lessons = await Lesson.find({
      module: { $in: moduleIds }
    });

  

    const completedLessonsCount =
      await LessonProgress.countDocuments({
        student: studentId,
        lesson: {
          $in: lessons.map(l => l._id)
        },
        completed: true
      });



    const allLessonsCompleted =
      lessons.length > 0 &&
      completedLessonsCount === lessons.length;


    if (allLessonsCompleted) {

      const inscription =
        await Inscription.findOneAndUpdate(
          {
            student: studentId,
            course: courseId
          },
          {
            status: 'completed'
          },
          {
            new: true
          }
        );

      console.log(
        'COURSE COMPLETED:',
        courseId,
        studentId
      );

      return res.status(200).json({
        success: true,

        message: 'Course completed!',

        data: {
          progress,

          completedCount: completedLessonsCount,

          totalLessons: lessons.length,

          courseCompleted: true,

          inscription
        }
      });
    }

    res.status(200).json({
      success: true,

      message: 'Lesson completed',

      data: {
        progress,

        completedCount: completedLessonsCount,

        totalLessons: lessons.length,

        courseCompleted: false
      }
    });

  } catch (error) {
    console.error('COMPLETE LESSON ERROR:', error);

    next(error);
  }
};