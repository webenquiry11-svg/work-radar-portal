const Notification = require('../models/notification.js');

class NotificationController {
  /**
   * @description Get all unread notifications for the logged-in user
   * @route GET /api/notifications
   * @access Private
   */
  static getMyNotifications = async (req, res) => {
    try {
      const notifications = await Notification.find({ recipient: req.user._id })
        .populate('subjectEmployee', 'name')
        .populate('relatedTask')
        .sort({ createdAt: -1 });
      res.status(200).json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Server error while fetching notifications." });
    }
  };

  /**
   * @description Mark notifications as read
   * @route PUT /api/notifications/mark-read
   * @access Private
   */
  static markNotificationsAsRead = async (req, res) => {
    try {
      await Notification.updateMany(
        { recipient: req.user._id, isRead: false },
        { $set: { isRead: true } }
      );
      res.status(200).json({ message: 'Notifications marked as read.' });
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      res.status(500).json({ message: "Server error while marking notifications as read." });
    }
  };

  /**
   * @description Delete all read notifications for the logged-in user
   * @route DELETE /api/notifications/read
   * @access Private
   */
  static deleteReadNotifications = async (req, res) => {
    try {
      await Notification.deleteMany({ recipient: req.user._id, isRead: true });
      res.status(200).json({ message: 'Read notifications cleared.' });
    } catch (error) {
      console.error("Error deleting read notifications:", error);
      res.status(500).json({ message: "Server error while deleting read notifications." });
    }
  };
}

module.exports = NotificationController;