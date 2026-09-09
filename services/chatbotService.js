const { Course, Inscription } = require('../models/Course');
const { QuizAttempt } = require('../models/QuizAttempt');
const ChatMessage = require('../models/ChatMessage');


async function buildContext(user) {
  if (user.role === 'student') {
    const attempts = await QuizAttempt.find({ student: user.id })
    .populate('quiz', 'title')
    .sort({ createdAt: -1 })
    .limit(10);

  const inscriptions = await Inscription.find({ student: user.id })
    .populate('course', 'title');

    const validInscriptions = inscriptions.filter(i => i.course);
const validAttempts = attempts.filter(a => a.quiz);

const enrolledCourses = validInscriptions.map(i => i.course.title);
const completedCourses = validInscriptions
  .filter(i => i.status === 'completed')
  .map(i => i.course.title);

return [
  `Cours inscrits: ${enrolledCourses.join(', ') || 'aucun'}`,
  `Cours complétés: ${completedCourses.join(', ') || 'aucun'}`,
  `Derniers résultats: ${validAttempts.map(a => `${a.quiz.title} (${a.score}/${a.totalQuestions})`).join(', ') || 'aucun'}`,
].join('\n');
  }

  if (user.role === 'teacher') {
    const courses = await Course.find({ teacher: user.id }).select('title');
    return `Cours enseignés: ${courses.map(c => c.title).join(', ') || 'aucun'}`;
  }

  return 'Utilisateur administrateur — accès global à la plateforme EduInsight.';
}

async function askLLM(message, context) {
  console.log('GROQ KEY utilisée:', process.env.GROQ_API_KEY?.slice(0, 10)); // temporaire, pour debug

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
       model: 'openai/gpt-oss-20b',
      messages: [
        {
          role: 'system',
          content: `Tu es l'assistant EduInsight, une plateforme d'analyse éducative. Réponds en français, de façon concise, en te basant uniquement sur ce contexte utilisateur:\n${context}`,
        },
        { role: 'user', content: message },
      ],
    }),
  });

  if (!response.ok) throw new Error(`LLM API error: ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

exports.getReply = async (user, message) => {
  const context = await buildContext(user);
  const reply = await askLLM(message, context);

  await ChatMessage.create({ user: user.id, role: 'user', content: message });
  await ChatMessage.create({ user: user.id, role: 'assistant', content: reply });

  return reply;
};

exports.getHistory = async (userId) => {
  return ChatMessage.find({ user: userId }).sort({ createdAt: 1 }).limit(50);
};