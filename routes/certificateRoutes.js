import express from 'express';
import  protect  from '../middlewares/authMiddleware.js';
import {
  checkAndIssueCertificate,
  listMyCertificates,
  downloadCertificate
} from '../controllers/certificateController.js';
import authorize from "../middlewares/roleMiddleware.js";
const router = express.Router();

router.get('/mine', protect,authorize("student"), listMyCertificates);
router.get('/course/:courseId/check', protect,authorize("student"), checkAndIssueCertificate);
router.get('/:id/download', protect,authorize("student"), downloadCertificate);

export default router;