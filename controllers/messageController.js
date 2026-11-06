import { Message } from '../models/Message.js';
import { Student, Teacher, Admin } from '../models/User.js';
import { Notification } from '../models/Notification.js';

// ============================================================
// GET CONTACTS (teachers of my department + admins)
// ============================================================
export const getContacts = async (req, res, next) => {
  try {
    const student = await Student.findById(req.user.id).select('department');

    const [teachers, admins] = await Promise.all([
      student?.department
        ? Teacher.find({ department: student.department }).select('firstName lastName')
        : [],
      Admin.find().select('firstName lastName'),
    ]);

    res.status(200).json({
      success: true,
      message: 'Contacts fetched',
      data: { teachers, admins },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// SEND MESSAGE
// ============================================================
export const sendMessage = async (req, res, next) => {
  try {
    const { recipient, subject, body } = req.body;

    if (!recipient || !subject?.trim() || !body?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis',
      });
    }

    const student = await Student.findById(req.user.id).select('department firstName lastName');

    // The student can only write to an admin or a teacher of his own department
    const isAdmin = await Admin.exists({ _id: recipient });
    const isMyTeacher = student?.department
      ? await Teacher.exists({ _id: recipient, department: student.department })
      : false;

    if (!isAdmin && !isMyTeacher) {
      return res.status(403).json({
        success: false,
        message: 'Destinataire non autorisé',
      });
    }

    const message = await Message.create({
      sender: req.user.id,
      recipient,
      subject,
      body,
    });
    await Notification.create({
    user: recipient,
    title: 'New message',
    message: `${student.firstName} ${student.lastName}: ${subject}`,
    type: 'new_message',
    });

    res.status(201).json({ success: true, message: 'Message envoyé', data: message });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET MY MESSAGES (?box=sent or inbox, default inbox)
// ============================================================
export const getMyMessages = async (req, res, next) => {
  try {
    const sent = req.query.box === 'sent';

    const messages = await Message.find(
      sent ? { sender: req.user.id } : { recipient: req.user.id }
    )
      .populate('sender recipient', 'firstName lastName role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, message: 'Messages fetched', data: messages });
  } catch (error) {
    next(error);
  }
};
// ============================================================
// MARK AS READ
// ============================================================
export const markAsRead = async (req, res, next) => {
  try {
    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true },
      { returnDocument: 'after' }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message introuvable',
      });
    }

    res.status(200).json({ success: true, message: 'Message lu', data: message });
  } catch (error) {
    next(error);
  }
};