import express from 'express';

import protect from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/roleMiddleware.js';
import { getContacts, sendMessage, getMyMessages,markAsRead } from '../controllers/messageController.js';

const router = express.Router();

router.get('/contacts', protect, authorize('student'), getContacts);
router.post('/', protect, authorize('student'), sendMessage);
router.get('/', protect, getMyMessages);
router.patch('/:id/read', protect, markAsRead);
export default router;