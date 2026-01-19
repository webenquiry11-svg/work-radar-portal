const Employee = require('../models/employee.js');
const Task = require('../models/task.js');
const Report = require('../models/report.js');
const Holiday = require('../models/holiday.js');
const Leave = require('../models/leave.js');

class PerformanceController {
  /**
   * @description Intelligently calculate and rank Employee of the Month candidates
   * based on Task Performance, Attendance, and Consistency.
   * @route GET /api/employees/employee-of-the-month
   */
  static getEmployeeOfTheMonthCandidates = async (req, res) => {
    try {
      const { month, year } = req.query;
      if (!month || !year) {
        return res.status(400).json({ message: 'Month and year are required.' });
      }

      const intYear = parseInt(year, 10);
      const intMonth = parseInt(month, 10);
      
      // Define the time range for the selected month in UTC
      const startDate = new Date(Date.UTC(intYear, intMonth - 1, 1));
      const endDate = new Date(Date.UTC(intYear, intMonth, 0, 23, 59, 59, 999));

      // Fetch all eligible employees (excluding Admins)
      const employees = await Employee.find({ role: { $ne: 'Admin' } })
        .select('name profilePicture employeeId department role');
      
      const holidays = await Holiday.find({ date: { $gte: startDate, $lte: endDate } });
      const holidayDates = new Set(holidays.map(h => h.date.toISOString().split('T')[0]));

      // 1. Calculate Total Working Days in the Month
      let totalWorkingDays = 0;
      let loopDate = new Date(startDate);
      while (loopDate <= endDate) {
        const dayOfWeek = loopDate.getUTCDay(); // 0 is Sunday
        const dateStr = loopDate.toISOString().split('T')[0];
        // Assuming Sunday is the only weekly off. Add Saturday check if needed.
        if (dayOfWeek !== 0 && !holidayDates.has(dateStr)) {
           totalWorkingDays++;
        }
        loopDate.setUTCDate(loopDate.getUTCDate() + 1);
      }
      if (totalWorkingDays === 0) totalWorkingDays = 1; // Prevent division by zero

      const candidates = [];

      for (const emp of employees) {
        // --- Metric A: Attendance Score (30%) ---
        const reports = await Report.find({ 
            employee: emp._id, 
            reportDate: { $gte: startDate, $lte: endDate }, 
            status: 'Submitted' 
        });
        const leaves = await Leave.find({ 
            employee: emp._id, 
            date: { $gte: startDate, $lte: endDate } 
        });
        
        const presentDays = reports.length;
        const leaveDays = leaves.length;
        // Effective working days for this specific employee (Total - Approved Leaves)
        const employeeWorkingDays = Math.max(1, totalWorkingDays - leaveDays);
        const attendancePercentage = Math.min(100, (presentDays / employeeWorkingDays) * 100);

        // --- Metric B: Task Performance Score (60%) ---
        // Fetch tasks that were either completed this month OR were due this month
        const tasks = await Task.find({
            assignedTo: emp._id,
            $or: [
                { completionDate: { $gte: startDate, $lte: endDate } },
                { dueDate: { $gte: startDate, $lte: endDate } }
            ]
        });

        let totalTaskScore = 0;
        let taskCount = 0;
        let completedTasks = 0;

        tasks.forEach(task => {
            taskCount++;
            let score = 0;
            const progress = task.progress || 0;

            if (task.status === 'Completed') {
                score = 100;
                completedTasks++;
                // Bonus: Completed on time or early
                if (task.completionDate && task.dueDate && new Date(task.completionDate) <= new Date(task.dueDate)) {
                    score += 5; // 5% Bonus for punctuality
                }
            } else if (task.status === 'Not Completed') {
                // Penalty: Task was rejected/incomplete. 
                // We give partial credit for progress but apply a 20% penalty on the grade.
                score = progress * 0.8; 
            } else if (task.status === 'Pending Verification') {
                score = 95; // High score, pending final approval
            } else {
                // Pending or In Progress
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
                if (isOverdue) {
                    score = progress * 0.5; // 50% Penalty for being overdue
                } else {
                    score = progress; // Current progress
                }
            }
            totalTaskScore += score;
        });

        const avgTaskScore = taskCount > 0 ? (totalTaskScore / taskCount) : 0;
        const normalizedTaskScore = Math.min(100, avgTaskScore); // Cap base score at 100

        // --- Metric C: Volume Bonus (Extra Points) ---
        // Reward employees who handle more tasks. 1 point per task, max 10 points.
        const volumeBonus = Math.min(10, taskCount * 1);

        // --- Final Weighted Score Calculation ---
        const finalScore = (normalizedTaskScore * 0.60) + (attendancePercentage * 0.30) + volumeBonus;

        candidates.push({
            ...emp.toObject(),
            score: parseFloat(finalScore.toFixed(2)),
            stats: {
                attendance: parseFloat(attendancePercentage.toFixed(1)),
                avgTaskScore: parseFloat(normalizedTaskScore.toFixed(1)),
                tasksCompleted: completedTasks,
                totalTasks: taskCount
            }
        });
      }

      // Sort candidates by highest score first
      candidates.sort((a, b) => b.score - a.score);

      res.status(200).json(candidates);
    } catch (error) {
      console.error('Error calculating EOM candidates:', error);
      res.status(500).json({ message: 'Server error during EOM calculation.' });
    }
  };
}

module.exports = PerformanceController;