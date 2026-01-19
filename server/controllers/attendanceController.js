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
    const startDate = new Date(`${year}-${String(month).padStart(2, '0')}-01T00:00:00.000Z`);
    const intYear = parseInt(year, 10);
    const intMonth = parseInt(month, 10);
    const endDate = new Date(Date.UTC(intYear, intMonth, 0, 23, 59, 59, 999));

    try {
      const reports = await Report.find({ employee: employeeId, reportDate: { $gte: startDate, $lte: endDate }, status: 'Submitted' });
      const holidays = await Holiday.find({ date: { $gte: startDate, $lte: endDate } });
      const leaves = await Leave.find({ employee: employeeId, date: { $gte: startDate, $lte: endDate } });

      // Fetch all tasks that could possibly be active during this month
      const tasksForMonth = await Task.find({
        assignedTo: employeeId,
        $or: [
            { startDate: { $lte: endDate } },
            { createdAt: { $lte: endDate } }
        ]
      });

      // Create a set of all days in the month where at least one task was "active" (visible in daily report).
      const activeTaskDays = new Set();
      
      tasksForMonth.forEach(task => {
        // Determine Start Date (Start of the task)
        const startRaw = task.startDate || task.createdAt;
        const taskStart = new Date(startRaw);
        taskStart.setUTCHours(0, 0, 0, 0);

        // Determine End Date (When the task stopped being active/visible)
        let taskEnd = new Date(); // Default to now (still active)
        taskEnd.setUTCHours(23, 59, 59, 999);

        if (['Completed', 'Not Completed', 'Pending Verification'].includes(task.status)) {
            // If finalized, it was active up until the completion day
            const completionDate = task.completionDate || task.submittedForCompletionDate || task.updatedAt;
            taskEnd = new Date(completionDate);
            taskEnd.setUTCHours(23, 59, 59, 999);
        } else {
            // If not finalized (Pending/In Progress), it remains active.
            // For the purpose of this month's calculation, we consider it active indefinitely (until today/future).
            // We set it to a far future date to ensure it covers the rest of the month.
            taskEnd = new Date(8640000000000000); 
        }

        // Loop through the requested month and mark days where this task was active
        let loopDate = new Date(startDate);
        while (loopDate <= endDate) {
            if (loopDate >= taskStart && loopDate <= taskEnd) {
                activeTaskDays.add(loopDate.toISOString().split('T')[0]);
            }
            loopDate.setUTCDate(loopDate.getUTCDate() + 1);
        }
      });

      const reportDates = new Set(reports.map(r => r.reportDate.toISOString().split('T')[0]));
      const holidayDates = new Set(holidays.map(h => h.date.toISOString().split('T')[0]));
      const leaveDates = new Set(leaves.map(l => l.date.toISOString().split('T')[0]));

      const attendanceData = [];
      const now = new Date();
      const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

      const d = new Date(startDate);
      while (d <= endDate) {
        const dateStr = d.toISOString().split('T')[0];
        const dayOfWeek = d.getUTCDay(); // 0 for Sunday
        let status = 'Future';

        if (d <= today) {
          // Priority 1: Holidays and Sundays
          if (dayOfWeek === 0) {
            status = 'Holiday';
          } else if (holidayDates.has(dateStr)) {
            status = 'Holiday';
          // Priority 2: Leaves
          } else if (leaveDates.has(dateStr)) {
            status = 'On Leave';
          // Priority 3: Report Submitted
          } else if (reportDates.has(dateStr)) {
            status = 'Present';
          } else {
            // Priority 4: No Report Submitted. Check Task Assignment.
            if (activeTaskDays.has(dateStr)) {
              // Task was assigned/active on this day.
              // If it's a past day, mark Absent. If today, mark Pending.
              if (d.getTime() < today.getTime()) {
                status = 'Absent';
              } else {
                status = 'Pending';
              }
            } else {
              // No task was assigned/active on this day.
              // Automatically mark as Present.
              status = 'Present';
            }
          }
        }

        attendanceData.push({
          date: dateStr,
          status: status,
        });

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