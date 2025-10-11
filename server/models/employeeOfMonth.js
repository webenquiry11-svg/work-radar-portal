const mongoose = require('mongoose');

const employeeOfMonthSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  month: { // 1-12
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  score: {
    type: Number,
    required: true,
    default: 0,
  },
}, { timestamps: true });

employeeOfMonthSchema.index({ company: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('EmployeeOfMonth', employeeOfMonthSchema);