const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true,
  },
  subjectEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    enum: ['info', 'task_approval', 'report_overdue', 'report_submitted'],
    default: 'info',
  },
  relatedTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null,
  },
  notificationDate: { // Used for daily uniqueness checks
    type: Date,
  },
}, { timestamps: true });

// Ensure that for a given task, there can only be one 'task_approval' notification at a time.
// This prevents duplicate notifications if multiple events try to trigger it simultaneously.
notificationSchema.index({ recipient: 1, relatedTask: 1, type: 1 }, {
  unique: true,
  partialFilterExpression: { type: 'task_approval', relatedTask: { $ne: null } }
});

// Ensure only one 'report_overdue' or 'report_submitted' notification per recipient, per employee, per day.
notificationSchema.index({ recipient: 1, subjectEmployee: 1, type: 1, notificationDate: 1 }, {
  unique: true,
  partialFilterExpression: { type: { $in: ['report_overdue', 'report_submitted'] } }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;