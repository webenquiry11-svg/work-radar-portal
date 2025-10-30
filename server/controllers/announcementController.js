const Announcement = require('../models/announcement.js');

class AnnouncementController {
  static getActiveAnnouncement = async (req, res) => {
    try {
      const userCompany = req.user.company;

      // Prioritize finding a company-specific announcement
      // An announcement is active if the current date is between its start and end dates.
      let announcement = await Announcement.findOne({
        company: userCompany,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      }).sort({ createdAt: -1 }).populate('relatedEmployee', 'name profilePicture');

      // If no company-specific announcement is found, look for a global one
      if (!announcement) {
        announcement = await Announcement.findOne({
          company: null, // Global announcement
          startDate: { $lte: new Date() },
          endDate: { $gte: new Date() }
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
    if (!title || !content || !startDate || !endDate) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
      // The 'expiresAt' field will be used by MongoDB's TTL index to auto-delete the document.
      const newAnnouncement = new Announcement({ 
        title, 
        content, 
        startDate, 
        endDate,
        expiresAt: endDate, // Set expiresAt to the end date for auto-deletion
        createdBy: req.user._id 
      });
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