const Report = require('../models/report.js');
const Task = require('../models/task.js');
const Notification = require('../models/notification.js');

class ReportController {
  /**
   * @description Get the current day's report for a specific employee
   * @route GET /api/reports/my-today/:employeeId
   * @access Employee
   */
  static getMyTodaysReport = async (req, res) => {
    // In a real app, employeeId would come from auth middleware (e.g., req.user.id)
    const { employeeId } = req.params;
    
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    try {
      const report = await Report.findOne({ employee: employeeId, reportDate: today });
      res.status(200).json(report); // Will be null if not found, which is expected
    } catch (error) {
      console.error("Error fetching today's report:", error);
      res.status(500).json({ message: "Server error while fetching today's report." });
    }
  };

  /**
   * @description Create or update the current day's report for an employee
   * @route POST /api/reports/my-today/:employeeId
   * @access Employee
   */
  static updateMyTodaysReport = async (req, res) => {
    const { employeeId } = req.params;
    const { content, status } = req.body;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Prevent updates if the report has already been submitted.
    try {
      const existingReport = await Report.findOne({ employee: employeeId, reportDate: today });

      if (existingReport && existingReport.status === 'Submitted') {
        return res.status(403).json({ message: 'Report has already been submitted and cannot be modified.' });
      }

      // If the report is being submitted, check for task completion updates.
      if (status === 'Submitted' && content) {
        try {
          const reportContent = JSON.parse(content);
          if (reportContent.taskUpdates && Array.isArray(reportContent.taskUpdates)) {
            for (const update of reportContent.taskUpdates) {
              const task = await Task.findById(update.taskId);
              if (task) {
                // If the task was previously rejected, the progress set by the manager is final.
                if (task.rejectionReason && task.status === 'In Progress') {
                  continue; // Skip progress update from employee
                }

                const completion = parseInt(update.completion, 10);
                task.progress = completion;

                if (completion === 100) {
                  // Only create a notification if the task is not already pending verification
                  if (task.status !== 'Pending Verification') {
                    task.status = 'Pending Verification';
                    task.submittedForCompletionDate = today; // Set submission date
                    
                    await Notification.create({
                      recipient: task.assignedBy,
                      subjectEmployee: employeeId,
                      message: `${req.user.name} has marked the task "${task.title}" as 100% complete.`,
                      type: 'task_approval',
                      relatedTask: task._id,
                    });
                  }
                } else if (completion > 0) {
                  task.status = 'In Progress';
                } else {
                  // If progress is 0, it remains 'Pending' unless it was already in progress
                  if (task.status !== 'In Progress') {
                    task.status = 'Pending';
                  }
                }
                await task.save();
              }
            }
          }
        } catch (e) {
          console.error("Could not parse report content to update tasks:", e);
        }
      }

      const updatedReport = await Report.findOneAndUpdate(
        { employee: employeeId, reportDate: today },
        { content, status, employee: employeeId, reportDate: today },
        { new: true, upsert: true, runValidators: true }
      );

      res.status(200).json({ message: 'Report saved successfully!', report: updatedReport });
    } catch (error) {
      console.error("Error updating today's report:", error);
      res.status(500).json({ message: "Server error while updating today's report." });
    }
  };

  /**
   * @description Get all reports for a specific employee
   * @route GET /api/reports/my-all/:employeeId
   * @access Employee
   */
  static getAllMyReports = async (req, res) => {
    const { employeeId } = req.params;

    try {
      // Find all reports for the employee and sort them by date in descending order
      const reports = await Report.find({ employee: employeeId }).sort({ reportDate: -1 }).lean();

      // Manually populate task details inside the JSON content
      const populatedReports = await Promise.all(reports.map(async (report) => {
        try {
          const content = JSON.parse(report.content);
          if (content.taskUpdates && Array.isArray(content.taskUpdates)) {
            content.taskUpdates = await Promise.all(content.taskUpdates.map(async (update) => {
              if (update.taskId) {
                const taskDetails = await Task.findById(update.taskId)
                  .populate({
                    path: 'comments',
                    populate: { path: 'author', select: 'name profilePicture' }
                  })
                  .lean();
                update.taskId = taskDetails; // Replace ID with full task object
              }
              return update;
            }));
            report.content = JSON.stringify(content);
          }
        } catch (e) { /* Ignore content that isn't valid JSON or doesn't have taskUpdates */ }
        return report;
      }));
      res.status(200).json(populatedReports);
    } catch (error) {
      console.error("Error fetching all reports for employee:", error);
      res.status(500).json({ message: "Server error while fetching reports." });
    }
  };

  /**
   * @description Get all reports for a specific employee (for Admin)
   * @route GET /api/reports/employee/:employeeId
   * @access Manager
   */
  static getReportsForEmployee = async (req, res) => {
    // In a real app, you'd add another middleware to check if req.user.role is 'manager'
    const { employeeId } = req.params;

    try {
      const reports = await Report.find({ employee: employeeId }).sort({ reportDate: -1 }).lean();

      // Manually populate task details inside the JSON content
      const populatedReports = await Promise.all(reports.map(async (report) => {
        try {
          const content = JSON.parse(report.content);
          if (content.taskUpdates && Array.isArray(content.taskUpdates)) {
            content.taskUpdates = await Promise.all(content.taskUpdates.map(async (update) => {
              if (update.taskId) {
                const taskDetails = await Task.findById(update.taskId)
                  .populate({
                    path: 'comments',
                    populate: { path: 'author', select: 'name profilePicture' }
                  })
                  .lean();
                update.taskId = taskDetails; // Replace ID with full task object
              }
              return update;
            }));
            report.content = JSON.stringify(content);
          }
        } catch (e) { /* Ignore content that isn't valid JSON or doesn't have taskUpdates */ }
        return report;
      }));
      res.status(200).json(populatedReports);
    } catch (error) {
      console.error("Error fetching reports for employee:", error);
      res.status(500).json({ message: "Server error while fetching reports." });
    }
  };

  /**
   * @description Delete a report by its ID
   * @route DELETE /api/reports/:id
   * @access Admin
   */
  static deleteReport = async (req, res) => {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to delete reports.' });
    }

    try {
      const report = await Report.findByIdAndDelete(req.params.id);

      if (!report) {
        return res.status(404).json({ message: 'Report not found.' });
      }

      res.status(200).json({ message: 'Report deleted successfully.' });
    } catch (error) {
      console.error('Error deleting report:', error);
      res.status(500).json({ message: 'Server error while deleting report.' });
    }
  };
}

module.exports = ReportController;