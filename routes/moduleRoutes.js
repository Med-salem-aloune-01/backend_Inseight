import express from 'express';
import {
  addModule,
  updateModule,
  deleteModule,
  getModulesByCourse,
  addLesson,
  updateLesson,
  deleteLesson,
  getLessonsByModule
} from '../controllers/moduleController.js';
import protect from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/roleMiddleware.js';

const router = express.Router();



router.post('/course/:courseId', addModule);
router.get('/course/:courseId', getModulesByCourse);
router.put('/:id', updateModule);
router.delete('/:id', deleteModule);


router.post('/:moduleId/lessons', addLesson);
router.get('/:moduleId/lessons', getLessonsByModule);
router.put('/lessons/:id', updateLesson);
router.delete('/lessons/:id', deleteLesson);

export default router
