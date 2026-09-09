import express from 'express';

import protect from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/roleMiddleware.js';

import {
  completeLesson,
  getCourseProgress
} from '../controllers/progressController.js';

const router = express.Router();

router.get(
  '/course/:courseId',
  protect,
  authorize(['student']),
  getCourseProgress
);

router.post(
  '/lesson/:lessonId/complete',
  protect,
  authorize(['student']),
  completeLesson
);

export default router;
