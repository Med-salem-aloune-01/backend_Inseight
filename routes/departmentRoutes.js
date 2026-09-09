import express from 'express';
import { 
  createDepartment, 
  getDepartments, 
  updateDepartment, 
  deleteDepartment 
} from '../controllers/departmentController.js';
import protect from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', getDepartments);

router.post('/', protect, authorize('admin'), createDepartment);
router.put('/:id', protect, authorize('admin'), updateDepartment);
router.delete('/:id', protect, authorize('admin'), deleteDepartment);

export default router;

