const Announcement = require('../models/announcement.js');

class AnnouncementController {
  static getActiveAnnouncement = async (req, res) => {
    try {
      const announcement = await Announcement.findOne({ isActive: true }).sort({ createdAt: -1 });
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
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    try {
      // Deactivate all other announcements
      await Announcement.updateMany({}, { isActive: false });

      const newAnnouncement = new Announcement({ title, content, createdBy: req.user._id, isActive: true });
      await newAnnouncement.save();
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