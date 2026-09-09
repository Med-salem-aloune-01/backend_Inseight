 
import { User, Admin, Teacher, Student } from '../models/User.js';
import bcrypt from 'bcryptjs';

export const createUser = async (req, res, next) => {
  try {
    const { email, password, role, ...rest } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    let newUser;
    const payload = { ...rest, email, password: hashedPassword };

    if (role === 'admin') newUser = await Admin.create(payload);
    else if (role === 'teacher') newUser = await Teacher.create(payload);
    else newUser = await Student.create(payload);

    res.status(201).json({ success: true, data: newUser });
  } catch (error) { next(error); }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: user });
  } catch (error) { next(error); }
};

export const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.status(200).json({ success: true, message: 'Utilisateur désactivé' });
  } catch (error) { next(error); }
};

import {Course} from "../models/Course.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });

    const totalStudents = await User.countDocuments({
      role: "student",
      isActive: true,
      
    });

    const totalTeachers = await User.countDocuments({
      role: "teacher",
      isActive: true,
    });

    const totalAdmins = await User.countDocuments({
      role: "admin",
      isActive: true,
    });

    const activeCourses = await Course.countDocuments();

    res.status(200).json({
      totalUsers,
      totalStudents,
      totalTeachers,
      totalAdmins,
      activeCourses,
      quizCompletion: 0,
      avgGrade: 0,
      alerts: [],
    });
  } catch (error) {
    next(error);
  }
};
export const assignStudentInfo = async (req, res, next) => {
  try {
    const { level, group, department } = req.body;

    const student = await User.findById(req.params.id);

    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: "Étudiant introuvable",
      });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { level, group, department },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Informations de l'étudiant mises à jour",
      data: updatedStudent,
    });
  } catch (error) { next(error); }
};