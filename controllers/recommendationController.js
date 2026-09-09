import { Notification, Recommendation, AuditLog } from '../models/Notification.js';

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: notifications });
  } catch (error) { next(error); }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notif = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
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
