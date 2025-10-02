const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

leaveSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Leave', leaveSchema);