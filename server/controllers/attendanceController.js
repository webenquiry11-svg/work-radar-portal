const Report = require('../models/report.js');
const Holiday = require('../models/holiday.js');
const Leave = require('../models/leave.js');
const Task = require('../models/task.js');

class AttendanceController {
  static getAttendanceForMonth = async (req, res) => {
    const { employeeId } = req.params;
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ message: 'Year and month are required.' });
    }

    // Use ISO date strings to ensure timezone-agnostic queries.
    // This creates a range from the first moment of the first day to the last moment of the last day in UTC.
    const startDate = new Date(`${year}-${String(month).padStart(2, '0')}-01T00:00:00.000Z`);
    // Correctly and reliably calculate the last day of the month in UTC by getting the 0th day of the *next* month.
    // The month argument in Date.UTC is 0-indexed (0-11), so we subtract 1 from the 1-based month from the query.
    // By setting day to 0 for the *next* month, we get the last day of the current month.
    const intYear = parseInt(year, 10);
    const intMonth = parseInt(month, 10); // This is 1-based (e.g., 9 for September)
    const endDate = new Date(Date.UTC(intYear, intMonth, 0, 23, 59, 59, 999));

    try {
      const reports = await Report.find({ employee: employeeId, reportDate: { $gte: startDate, $lte: endDate }, status: 'Submitted' });
      const holidays = await Holiday.find({ date: { $gte: startDate, $lte: endDate } });
      const leaves = await Leave.find({ employee: employeeId, date: { $gte: startDate, $lte: endDate } });

      const reportDates = new Set(reports.map(r => r.reportDate.toISOString().split('T')[0]));
      const holidayDates = new Set(holidays.map(h => h.date.toISOString().split('T')[0]));
      const leaveDates = new Set(leaves.map(l => l.date.toISOString().split('T')[0]));

      const attendanceData = [];
      // Get today's date at midnight UTC to ensure accurate "past" vs "future" comparison
      const now = new Date();
      const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

      const d = new Date(startDate);
      while (d <= endDate) {
        const dateStr = d.toISOString().split('T')[0];
        const dayOfWeek = d.getUTCDay(); // 0 for Sunday, 1 for Monday, etc.
        let status = 'Future';

        if (d <= today) {
          // It's today or a past date, so determine the status
          // Priority 1: Check for company-wide holidays and Sundays first.
          if (dayOfWeek === 0) {
            status = 'Holiday';
          } else if (holidayDates.has(dateStr)) { // Company-wide holidays
            status = 'Holiday';
          // Priority 2: If not a holiday, check for employee-specific leave.
          } else if (leaveDates.has(dateStr)) {
            status = 'On Leave';
          // Priority 3: If it's a working day, check for report submission.
          } else if (reportDates.has(dateStr)) { // Report was submitted
            status = 'Present';
          } else if (d.getTime() < today.getTime()) {
            // It's a past working day with no report.
            // Check if there were any active tasks for that day.
            const dayStart = new Date(d);
            const dayEnd = new Date(d);
            dayEnd.setUTCHours(23, 59, 59, 999);
            const activeTaskCount = await Task.countDocuments({
              assignedTo: employeeId,
              createdAt: { $lte: dayEnd }, // Task was created on or before this day
              status: { $in: ['Pending', 'In Progress'] }
            });
            status = (activeTaskCount === 0) ? 'Present' : 'Absent';
          } else {
            // It's the current working day with no report yet.
            status = 'Pending';
          }
        }

        attendanceData.push({
          date: dateStr,
          status: status,
        });

        // Increment the day at the end of the loop
        d.setUTCDate(d.getUTCDate() + 1);
      }

      res.status(200).json(attendanceData);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      res.status(500).json({ message: 'Server error while fetching attendance data.' });
    }
  };
}

module.exports = AttendanceController;