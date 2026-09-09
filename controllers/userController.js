import { User, Admin, Teacher, Student } from '../models/User.js';
import { Course, Inscription } from '../models/Course.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export const ajouterUtilisateur = async (req, res) => {
  try {
    const nouvelUser = new User(req.body);
    await nouvelUser.save();
    res.status(201).json(nouvelUser);
  } catch (err) {
    res.status(400).json({ message: "Erreur d’ajout", error: err.message });
  }
};

export const listerUtilisateurs = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().skip(skip).limit(limit),
      User.countDocuments(),
    ]);

    res.json({
      users,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUtilisateurById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération", error: err.message });
  }
};

export const updateUtilisateur = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: "Erreur de mise à jour", error: err.message });
  }
};

export const deleteUtilisateur = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur de suppression", error: err.message });
  }
};


export const updateMe = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, avatar, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email.toLowerCase();
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Mot de passe actuel requis' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Mot de passe actuel incorrect' });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({ success: true, message: 'Profil mis à jour', data: userData });
  } catch (error) {
    next(error);
  }
};
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('department'); // .id, pas ._id
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
export const listStudentsteach = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const teacherId = req.user.id;

    // Courses created by this teacher
    const courses = await Course.find({ teacher: teacherId }).select('_id');
    const courseIds = courses.map(course => course._id);

    // Students enrolled in teacher's courses
    const inscriptions = await Inscription.find({
      course: { $in: courseIds }
    }).populate('student', 'firstName lastName email');

    // Remove duplicate students
    const studentMap = new Map();

    inscriptions.forEach(inscription => {
      if (inscription.student) {
        const id = inscription.student._id.toString();

        if (!studentMap.has(id)) {
          studentMap.set(id, {
            ...inscription.student.toObject(),
            enrolledCount: 0
          });
        }

        studentMap.get(id).enrolledCount++;
      }
    });

    // Get only student IDs
    const studentIds = Array.from(studentMap.keys());

    const [usersdata, total] = await Promise.all([
      User.aggregate([
        {
          $match: {
            _id: {
              $in: studentIds.map(id => new mongoose.Types.ObjectId(id))
            }
          }
        },

        {
          $lookup: {
            from: "inscriptions",
            let: { studentId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$student", "$$studentId"] },
                      { $in: ["$course", courseIds] }
                    ]
                  }
                }
              }
            ],
            as: "enrollments"
          }
        },

        {
          $lookup: {
            from: "quizattempts",
            localField: "_id",
            foreignField: "student",
            as: "attempts"
          }
        },

        {
          $addFields: {
            enrolledCount: { $size: "$enrollments" },

            averageGrade: {
              $cond: [
                { $gt: [{ $size: "$attempts" }, 0] },
                { $avg: "$attempts.score" },
                0
              ]
            }
          }
        },

        {
          $project: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            email: 1,
            enrolledCount: 1,
            averageGrade: 1
          }
        },

        { $sort: { lastName: 1 } },
        { $skip: skip },
        { $limit: limit }
      ]),

      studentIds.length
    ]);

    res.status(200).json({
      success: true,
      users: usersdata,
      total,
      pages: Math.ceil(total / limit),
      page
    });

  } catch (error) {
    next(error);
  }
};
export const listerEtudiants = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = { role: "student" };

    if (req.query.status === "actif") {
      filter.isActive = true;
    } else if (req.query.status === "inactif") {
      filter.isActive = false;
    }

    const [users, total] = await Promise.all([
      User.aggregate([
        { $match: filter },
        { $sort: { lastName: 1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "inscriptions",
            localField: "_id",
            foreignField: "student",
            as: "enrollments",
          },
        },
        {
          $lookup: {
            from: "quizattempts",
            localField: "_id",
            foreignField: "student",
            as: "attempts",
          },
        },
        {
          $addFields: {
            enrolledCount: { $size: "$enrollments" },
            averageGrade: {
              $cond: [
                { $gt: [{ $size: "$attempts" }, 0] },
                { $avg: "$attempts.score" },
                null,
              ],
            },
          },
        },
        {
          $project: {
            password: 0,
            enrollments: 0,
            attempts: 0,
          },
        },
      ]),
      User.countDocuments(filter),
    ]);

    res.json({
      users,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};