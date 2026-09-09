import express from 'express';
import {
  createUser,
  updateUser,
  deleteUser,
  getDashboardStats,
  assignStudentInfo
} from "../controllers/adminController.js";
import protect from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/roleMiddleware.js';
const router = express.Router();


router.use(protect, authorize('admin'));
router.get("/", getDashboardStats);

router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/:id/assign-info', protect, authorize('admin'), assignStudentInfo);
export default router;
