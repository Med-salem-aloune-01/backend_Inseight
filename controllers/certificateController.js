import Certificate from '../models/Certificate.js';
import { Lesson, Module } from '../models/Module.js';
import { Inscription } from '../models/Course.js';
import { Quiz, Question } from '../models/Quiz.js';
import { QuizAttempt } from '../models/QuizAttempt.js';
import PDFDocument from 'pdfkit';

// ============================================================
// Compute a student's final grade for a course based on
// their best attempt on each quiz belonging to that course
// ============================================================
export const computeFinalGradeForCourse = async (studentId, courseId) => {

  const quizzes = await Quiz.find({ course: courseId }).lean();

  if (quizzes.length === 0) {
    return 100;
    // No quizzes in this course -> grade based on lessons only
  }

  let totalPercentage = 0;
  let countedQuizzes = 0;

  for (const quiz of quizzes) {

    const bestAttempt = await QuizAttempt.findOne({
      student: studentId,
      quiz: quiz._id,
      submittedAt: { $ne: null }
    }).sort({ score: -1 }).lean();

    if (!bestAttempt) {
      continue;
      // Quiz not attempted -> excluded from average (adjust to count as 0 if you want to penalize)
    }

    const maxPointsResult = await Question.aggregate([
      { $match: { quiz: quiz._id } },
      { $group: { _id: null, total: { $sum: '$points' } } }
    ]);

    const maxScore = maxPointsResult[0]?.total || 0;
    const percentage = maxScore > 0 ? (bestAttempt.score / maxScore) * 100 : 0;

    totalPercentage += percentage;
    countedQuizzes += 1;
  }

  return countedQuizzes > 0 ? totalPercentage / countedQuizzes : 0;
};
export const checkAndIssueCertificate = async (req, res, next) => {
  try {
    const certificate = await issueCertificateForCompletedCourse(
      req.user.id,
      req.params.courseId
    );

    if (!certificate) {
      return res.status(200).json({
        success: true,
        message: "Course not completed yet",
        data: {
          eligible: false
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: "Certificate issued",
      data: {
        eligible: true,
        certificate
      }
    });

  } catch (error) {
    next(error);
  }
};


export const listMyCertificates = async (req, res, next) => {
  try {

    const completedInscriptions = await Inscription.find({
      student: req.user.id,
      status: 'completed'
    }).lean();

    console.log('Completed inscriptions found:', completedInscriptions.length);

    const results = await Promise.all(
      completedInscriptions.map((inscription) =>
        issueCertificateForCompletedCourse(req.user.id, inscription.course)
      )
    );

    console.log('Issue results:', results);

    const certificates = await Certificate.find({
      student: req.user.id
    }).populate('course', 'title');

    res.status(200).json({
      success: true,
      message: 'Certificates fetched',
      data: { certificates }
    });

  } catch (error) {
    next(error);
  }
};


export const downloadCertificate = async (req, res, next) => {
  try {

    const certificate = await Certificate.findById(req.params.id)
      .populate('course', 'title')
      .populate('student', 'firstName lastName');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    if (certificate.student._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden'
      });
    }

    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${certificate.certificateId}.pdf`);

    doc.pipe(res);

    const { width, height } = doc.page;

    doc.rect(0, 0, width, height).fill('#fdf6e3');
    doc.rect(20, 20, width - 40, height - 40).lineWidth(2).stroke('#c9a227');

    doc.fillColor('#8a6d00').fontSize(34).font('Helvetica-Bold')
      .text('Certificate of Completion', 0, 120, { align: 'center' });

    doc.fillColor('#333').fontSize(14).font('Helvetica')
      .text('This certifies that', 0, 190, { align: 'center' });

    const studentName = `${certificate.student.firstName} ${certificate.student.lastName}`;

    doc.fillColor('#111').fontSize(24).font('Helvetica-Bold')
      .text(studentName, 0, 215, { align: 'center' });

    doc.fillColor('#333').fontSize(14).font('Helvetica')
      .text('has successfully completed', 0, 255, { align: 'center' });

    doc.fillColor('#111').fontSize(22).font('Helvetica-Bold')
      .text(certificate.course.title, 0, 280, { align: 'center' });

    doc.fillColor('#555').fontSize(12).font('Helvetica')
      .text(`Grade: ${certificate.grade}%`, 0, 325, { align: 'center' })
      .text(`Date: ${new Date(certificate.issuedAt).toLocaleDateString()}`, 0, 342, { align: 'center' })
      .text(`Certificate ID: ${certificate.certificateId}`, 0, 359, { align: 'center' });

    doc.end();

  } catch (error) {
    next(error);
  }
};
export const issueCertificateForCompletedCourse = async (studentId, courseId) => {
  const existing = await Certificate.findOne({
    student: studentId,
    course: courseId
  });

  if (existing) {
    return existing;
  }

  const inscription = await Inscription.findOne({
    student: studentId,
    course: courseId
  });

  if (!inscription || inscription.status !== 'completed') {
    return null;
  }

  const finalGrade = await computeFinalGradeForCourse(studentId, courseId);

  const certificate = await Certificate.create({
    student: studentId,
    course: courseId,
    grade: finalGrade
  });

  return certificate;
};