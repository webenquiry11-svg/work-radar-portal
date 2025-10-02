const Leave = require('../models/leave.js');

class LeaveController {
  static getLeavesForEmployee = async (req, res) => {
    try {
      const leaves = await Leave.find({ employee: req.params.employeeId });
      res.status(200).json(leaves);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching leave records.' });
    }
  };

  static addLeave = async (req, res) => {
    const { employeeId } = req.params;
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ message: 'Date is required.' });
    }

    try {
      const newLeave = new Leave({ employee: employeeId, date: new Date(date) });
      await newLeave.save();
      res.status(201).json(newLeave);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ message: 'This date is already marked as leave for this employee.' });
      }
      res.status(500).json({ message: 'Error adding leave.' });
    }
  };

  static removeLeave = async (req, res) => {
    const { leaveId } = req.params;
    try {
      const deleted = await Leave.findByIdAndDelete(leaveId);
      if (!deleted) {
        return res.status(404).json({ message: 'Leave record not found.' });
      }
      res.status(200).json({ message: 'Leave record deleted.' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting leave record.' });
    }
  };
}

module.exports = LeaveController;