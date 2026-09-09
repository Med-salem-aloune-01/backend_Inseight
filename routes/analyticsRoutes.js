import express from 'express';
import { 
  generateForStudent, 
  generateForTeacher, 
  generateForAdmin 
} from '../controllers/analyticsController.js';
import protect from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/student', protect, authorize('student','admin'), generateForStudent);
router.get('/teacher/course/:courseId', protect, authorize('teacher','admin'), generateForTeacher);
router.get('/admin', protect, authorize('admin',('teacher')), generateForAdmin);

export default router;
