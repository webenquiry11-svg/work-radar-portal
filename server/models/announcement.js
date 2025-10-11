const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  company: {
    type: String,
    trim: true,
    default: null, // Null means it's a global announcement
  },
  relatedEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null,
  },
  expiresAt: {
    type: Date,
    default: null, // Will be null for permanent announcements
  },
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);