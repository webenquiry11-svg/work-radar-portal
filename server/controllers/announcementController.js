const Announcement = require('../models/announcement.js');
const Employee = require('../models/employee.js');
const Notification = require('../models/notification.js');

class AnnouncementController {
  static getActiveAnnouncement = async (req, res) => {
    try {
      const userCompany = req.user.company;

      // Prioritize finding a company-specific announcement
      let announcement = await Announcement.findOne({
        isActive: true,
        company: userCompany,
        $or: [
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } }
        ]
      }).sort({ createdAt: -1 }).populate('relatedEmployee', 'name profilePicture');

      // If no company-specific announcement is found, look for a global one
      if (!announcement) {
        announcement = await Announcement.findOne({
          isActive: true,
          company: null, // Global announcement
          $or: [
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } }
          ]
        }).sort({ createdAt: -1 }).populate('relatedEmployee', 'name profilePicture');
      }

      res.status(200).json(announcement); // Will be null if none are active
    } catch (error) {
      res.status(500).json({ message: 'Error fetching announcement.' });
    }
  };

  static getAllAnnouncements = async (req, res) => {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    try {
      const announcements = await Announcement.find({}).populate('createdBy', 'name').sort({ createdAt: -1 });
      res.status(200).json(announcements);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching announcements.' });
    }
  };

  static createAnnouncement = async (req, res) => {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    const { title, content, startDate, endDate } = req.body;
    if (!title.trim() || !content.trim()) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    // Validate that if dates are provided, they are valid
    if ((startDate && isNaN(new Date(startDate))) || (endDate && isNaN(new Date(endDate)))) {
      return res.status(400).json({ message: 'Invalid start or end date format.' });
    }

    try {
      const newAnnouncement = new Announcement({ 
        title, 
        content, 
        createdBy: req.user._id, 
        isActive: true,
        startDate: startDate || null,
        endDate: endDate || null,
      });
      await newAnnouncement.save();

      // Notify all employees about the new announcement
      const allEmployees = await Employee.find({ _id: { $ne: req.user._id } }).select('_id');
      const notifications = allEmployees.map(emp => ({
        recipient: emp._id,
        message: `A new announcement has been published: "${title}"`,
        type: 'info',
      }));
      if (notifications.length > 0) await Notification.insertMany(notifications);

      res.status(201).json(newAnnouncement);
    } catch (error) {
      res.status(500).json({ message: 'Error creating announcement.' });
    }
  };

  static deleteAnnouncement = async (req, res) => {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    const { id } = req.params;
    try {
      const deleted = await Announcement.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Announcement not found.' });
      }
      res.status(200).json({ message: 'Announcement deleted.' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting announcement.' });
    }
  };
}

module.exports = AnnouncementController;