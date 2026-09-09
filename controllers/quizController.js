import { Quiz, Question, Choice } from '../models/Quiz.js';

export const createQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, duration, passingScore } = req.body;

    const quiz = await Quiz.create({
      title,
      description,
      duration,
      passingScore,
      course: courseId,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: "Quiz créé avec succès",
      data: quiz
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Erreur lors de la création du quiz",
      error: error.message
    });
  }
};

export const updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz non trouvé' });
    }
    res.status(200).json({ success: true, data: quiz });
  } catch (error) { next(error); }
};

export const addQuestion = async (req, res, next) => {
  try {
    const { choices, ...questionData } = req.body;
    const question = await Question.create({ ...questionData, quiz: req.params.quizId });

    if (choices && choices.length > 0) {
      const choiceDocs = choices.map(c => ({ ...c, question: question._id }));
      await Choice.insertMany(choiceDocs);
    }

    res.status(201).json({ success: true, data: question });
  } catch (error) { next(error); }
};

export const deleteQuiz = async (req, res, next) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Quiz supprimé' });
  } catch (error) { next(error); }
};

export const getQuizzes = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.user?.role === 'teacher') {
      filter.createdBy = req.user.id;
    }

    const [quizzes, total] = await Promise.all([
      Quiz.find(filter).populate('course', 'title').skip(skip).limit(limit),
      Quiz.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: quizzes,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('getQuizzes error:', error.message, error.stack);
    next(error);
  }
  console.log('req.user:', req.user);
};
export const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('course', 'title');
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz non trouvé' });
    }
    res.status(200).json({ success: true, data: quiz });
  } catch (error) { next(error); }
};

export const getQuizQuestions = async (req, res, next) => {
  try {
    const questions = await Question.find({ quiz: req.params.quizId })
      .sort({ order: 1 })
      .lean();

    const questionIds = questions.map(q => q._id);
    const questionNbr=questions.length;

    const choices = await Choice.find({ question: { $in: questionIds } })
      .sort({ order: 1 })
      .select('-isCorrect')
      .lean();

    const questionsWithChoices = questions.map(q => ({
      ...q,
      choices: choices.filter(c => c.question.toString() === q._id.toString())
    }));

    res.status(200).json({ success: true, data: questionsWithChoices });
  } catch (error) { next(error); }
};
export const publishQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz non trouvé'
      });
    }

    quiz.isPublished = !quiz.isPublished;

    await quiz.save();

    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    next(error);
  }
};