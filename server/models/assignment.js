const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    unique: true, // Ensures each employee has only one assignment entry
  },
  department: {
    type: String,
    required: true,
    trim: true,
    enum: {
      values: [
        'Corporate management',
        'Human Resource',
        'Creative Designing',
        'Finance & Accounts',
        'Marketing Operations',
        'Sales & Marketing',
        'Tech & Development'
      ],
      message: '{VALUE} is not a supported department.'
    },
  },
  teamLead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
}, { timestamps: true });

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;