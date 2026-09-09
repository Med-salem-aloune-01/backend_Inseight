import express from 'express';
import { takeQuiz, submitAnswers, getMyBestScores , getBestScoreForQuiz } from '../controllers/quizAttemptController.js';
import protect from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.use(protect);


router.post('/start/:quizId', authorize('student'), takeQuiz);
router.post('/:attemptId/submit', authorize('student'), submitAnswers);

router.get('/best-scores', authorize('student'), getMyBestScores);
router.get('/best/:quizId', authorize('student'), getBestScoreForQuiz);
export default router;

