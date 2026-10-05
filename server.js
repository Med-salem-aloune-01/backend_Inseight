import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import path from "path";
import userRoutes from './routes/userRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import moduleRoutes from './routes/moduleRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import quizAttemptRoutes from './routes/quizAttemptRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import certificatesRoutes from './routes/certificateRoutes.js';

dotenv.config();
const app = express();

// Middleware
app.use(cors({
  origin: [
    "https://frontend-inseight-a4iq.vercel.app/",
    "http://localhost:5173",
  ],
  credentials: true,
}));
app.use(express.json());
app.get('/', (req, res) => res.send('API is running'));

// Connexion BDD
connectDB();
import progressRoutes from './routes/progressRoutes.js';

app.use('/api/progress', progressRoutes);
// Routes
app.use("/api/users", userRoutes);
app.use("/api/cours", courseRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/quiz-attempts', quizAttemptRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/certificates',certificatesRoutes); 
// Serve uploads folder
app.use("/uploads", express.static(path.join(path.resolve(), "/uploads")));

// Lancer le serveur
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
