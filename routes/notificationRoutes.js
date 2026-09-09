import express from 'express';
import { 
  getNotifications, 
  markAsRead, 
  getRecommendations,
  getUnreadCount,
  markAllAsRead,
  createCourse
} from '../controllers/notificationController.js';
import protect from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.post('/', protect, authorize('teacher', 'admin'), createCourse);
router.get('/noti', getNotifications);
router.patch('/:id/read', markAsRead);
router.get('/recommendations', authorize('student'), getRecommendations);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllAsRead);
export default router;

