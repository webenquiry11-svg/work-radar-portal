const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['Draft', 'Submitted'],
    default: 'Draft',
  },
  reportDate: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

// To prevent an employee from submitting multiple reports for the same day
reportSchema.index({ employee: 1, reportDate: 1 }, { unique: true });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;