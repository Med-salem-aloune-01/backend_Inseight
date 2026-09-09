import express from 'express';
import multer from 'multer';
import protect from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/roleMiddleware.js';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  getMyInscriptions,
  getmyCourses,
  creerCours
} from '../controllers/courseController.js';
const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.get('/', protect, getmyCourses);

router.get('/:id', protect, getCourseById);


router.post('/:id/enroll',
  protect,
  authorize(["teacher","student"]), 
  enrollCourse
);

router.get('/inscriptions/mine',protect,getMyInscriptions );
router.post('/ajouter', upload.single('image'), protect, authorize(['teacher', 'admin']), createCourse);
router.post('/ajouterme', upload.single('image'), protect, authorize(['teacher', 'admin']), creerCours);
router.put('/:id', protect, authorize(['teacher', 'admin']), updateCourse);
router.delete(
  '/:id',
  protect,
  authorize(['teacher', 'admin']),
  deleteCourse
);

export default router;