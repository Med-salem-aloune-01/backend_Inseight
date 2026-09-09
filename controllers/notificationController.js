import { Notification, Recommendation, AuditLog } from '../models/Notification.js';
import { Student,User } from '../models/User.js';
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: notifications });
  } catch (error) { next(error); }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.status(200).json({ success: true, data: notif });
  } catch (error) { next(error); }
};

export const getRecommendations = async (req, res, next) => {
  try {
    const recommendations = await Recommendation.find({ student: req.user.id });
    res.status(200).json({ success: true, data: recommendations });
  } catch (error) { next(error); }
};

export const logAudit = async (userId, action, entity, entityId, ipAddress) => {
  await AuditLog.create({ user: userId, action, entity, entityId, ipAddress });
};
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
    res.status(200).json({ success: true });
  } catch (error) { next(error); }
};
export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ user: req.user.id, isRead: false });
    res.status(200).json({ success: true, data: count });
  } catch (error) { next(error); }
};


export const createCourse = async (req, res, next) => {
  try {
    const course = await course.create(req.body);

    const students = await Student.find({
      level: course.level,
      department: course.department,
    }).select('_id');

    if (students.length) {
      const notifications = students.map(s => ({
        user: s._id,
        title: 'New course available',
        message: `A new course "${course.title}" was added for your level.`,
        type: 'new_course',
      }));
      await Notification.insertMany(notifications);
    }

    await logAudit(req.user.id, 'CREATE', 'Course', course._id, req.ip);

    res.status(201).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};
export const notifyAdmins = async ({ title, message, type = 'system' }) => {
  try {
    const admins = await User.find({ role: 'admin', isActive: true }).select('_id');

    if (admins.length) {
      const notifications = admins.map((admin) => ({
        user: admin._id,
        title,
        message,
        type,
      }));
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error('Failed to create admin notifications', error);
  }
};