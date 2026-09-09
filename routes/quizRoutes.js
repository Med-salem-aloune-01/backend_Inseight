import express from 'express';
import { 
  createQuiz,
  publishQuiz,
  addQuestion,
  deleteQuiz,
  getQuizzes,
  getQuizById,
  getQuizQuestions,
  updateQuiz
} from '../controllers/quizController.js';
import protect from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/listQuizzes', protect, getQuizzes); 

router.get('/:quizId/questions', protect, authorize(['student']), getQuizQuestions);
router.put(
  '/:id/modify',
  protect,
  authorize(["teacher", "admin"]),
  updateQuiz
);
router.get('/:id', protect, getQuizById);
router.post(
  '/:courseId',
  protect,
  authorize(["teacher","admin"]),
  createQuiz
);
router.patch('/:id/publish', publishQuiz);
router.post('/:quizId/questions', addQuestion);
router.delete('/:id', deleteQuiz);

export default router;
