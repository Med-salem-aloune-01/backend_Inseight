import { Module,Lesson  } from '../models/Module.js';
// Module Controllers
export const addModule = async (req, res, next) => {
  try {
    const module = await Module.create({ ...req.body, course: req.params.courseId });
    res.status(201).json({ success: true, data: module });
  } catch (error) { next(error); }
};

export const updateModule = async (req, res, next) => {
  try {
    const module = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: module });
  } catch (error) { next(error); }
};

export const deleteModule = async (req, res, next) => {
  try {
    await Module.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Module supprimé' });
  } catch (error) { next(error); }
};

export const addLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.create({ ...req.body, module: req.params.moduleId });
    res.status(201).json({ success: true, data: lesson });
  } catch (error) { next(error); }
};

export const updateLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: lesson });
  } catch (error) { next(error); }
};

export const deleteLesson = async (req, res, next) => {
  try {
    await Lesson.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Leçon supprimée' });
  } catch (error) { next(error); }
};

export const getModulesByCourse = async (req, res, next) => {
  try {
    const modules = await Module.find({ course: req.params.courseId })
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: modules
    });
  } catch (error) {
    next(error);
  }
};

// Get all lessons of a module
export const getLessonsByModule = async (req, res, next) => {
  try {
    const lessons = await Lesson.find({ module: req.params.moduleId })
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: lessons
    });
  } catch (error) {
    next(error);
  }
};