const Employee = require('../models/employee.js');
const Assignment = require('../models/assignment.js');
const Report = require('../models/report.js');
const { cloudinary } = require('../config/cloudinary.js');
const Task = require('../models/task.js');
const EmployeeOfMonth = require('../models/employeeOfMonth.js');
const Announcement = require('../models/announcement.js');
const bcrypt = require('bcryptjs');
const ScoringSettings = require('../models/scoringSettings.js');

class ManageEmployeeController {
  /**
   * @description Add a new employee
   * @route POST /api/employees
   * @access Admin
   */
  static addEmployee = async (req, res) => {
    const { 
      name, email, password, role, employeeId,
      address, gender, country, city, qualification,
      experience, workType, company, joiningDate, dashboardAccess, department,
      workLocation, shift 
    } = req.body;

    // Profile picture will be in req.file if uploaded
    const profilePicture = req.file ? req.file.path : '';

    if (!name || !email || !password || !role || !employeeId) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    try {
      const existingEmployee = await Employee.findOne({ $or: [{ email }, { employeeId }] });
      if (existingEmployee) {
        return res.status(409).json({ message: 'Employee with this email or ID already exists.' });
      }

      const newEmployee = new Employee({
        name, email, password, role, employeeId,
        profilePicture, address, gender, country, city,
        qualification, experience, workType, company, dashboardAccess, department,
        joiningDate, workLocation, shift
      });

      await newEmployee.save();
      res.status(201).json({ message: 'Employee added successfully', employee: newEmployee });
    } catch (error) {
      console.error('Error adding employee:', error);
      res.status(500).json({ message: 'Server error while adding employee.' });
    }
  };

  /**
   * @description Update an existing employee
   * @route PUT /api/employees/:id
   * @access Admin
   */
  static updateEmployee = async (req, res) => {
    const { id } = req.params;
    
    const updateData = {};

    // Create a list of fields that can be updated
    const fieldsToUpdate = [
      'name', 'email', 'role', 'employeeId', 'address', 'gender', 'country', 'city',
      'qualification', 'experience', 'workType', 'company', 'joiningDate',
      'dashboardAccess', 'department', 'workLocation', 'shift', 'canEditProfile', 'canViewTeam',
      'canUpdateTask', 'canApproveTask', 'canAssignTask', 'canDeleteTask', 'canViewAnalytics'
    ];

    // Iterate over the fields and add them to updateData if they exist in the request body
    fieldsToUpdate.forEach(field => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updateData[field] = req.body[field];
      }
    });

    // If a new profile picture is being uploaded, delete the old one first.
    if (req.file) {
      try {
        const employee = await Employee.findById(id);
        // Only attempt to delete if there is a profile picture and it's a cloudinary URL
        if (employee && employee.profilePicture && employee.profilePicture.includes('cloudinary.com')) {
          // Extract public_id from the Cloudinary URL
          const urlParts = employee.profilePicture.split('/');
          const cloudinaryVIndex = urlParts.findIndex(part => part.startsWith('v') && !isNaN(part.substring(1)));
          const publicIdWithExtension = urlParts.slice(cloudinaryVIndex + 1).join('/');
          const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.')) || publicIdWithExtension;
          if (publicId) await cloudinary.uploader.destroy(publicId);
        }
      } catch (e) {
        console.error("Error deleting old profile picture from Cloudinary:", e);
        // Don't block the update if deletion fails, just log it.
      }
    }

    if (req.file) {
      updateData.profilePicture = req.file.path;
    }

    // If a new password is provided, hash it before updating.
    if (req.body.password) {
      updateData.password = await bcrypt.hash(req.body.password, 10);
    }

    try {
      const updatedEmployee = await Employee.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true } // Return the updated document and run validators
      );

      if (!updatedEmployee) {
        return res.status(404).json({ message: 'Employee not found.' });
      }

      res.status(200).json({ message: 'Employee updated successfully', employee: updatedEmployee });
    } catch (error) {
      console.error('Error updating employee:', error);
      if (error.code === 11000) { // MongoDB duplicate key error code
        const field = Object.keys(error.keyValue)[0];
        return res.status(409).json({ message: `An employee with this ${field} already exists.` });
      }
      res.status(500).json({ message: 'Server error while updating employee.' });
    }
  };

  /**
   * @description Delete an employee
   * @route DELETE /api/employees/:id
   * @access Admin
   */
  static deleteEmployee = async (req, res) => {
    try {
      const { id } = req.params;
      const employee = await Employee.findById(id);
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found.' });
      }
      // Using deleteOne() will trigger the 'pre' middleware in the schema
      await employee.deleteOne();
      res.status(200).json({ message: 'Employee deleted successfully.' });
    } catch (error) {
      console.error('Error deleting employee:', error);
      res.status(500).json({ message: 'Server error while deleting employee.' });
    }
  };

  /**
   * @description Get dashboard statistics
   * @route GET /api/stats
   * @access Admin
   */
  static getDashboardStats = async (req, res) => {
    try {
      const totalTasks = await Task.countDocuments();
      const tasksPendingVerification = await Task.countDocuments({ status: 'Pending Verification' });

      const totalEmployees = await Employee.countDocuments({ role: { $ne: 'Admin' } });

      const managers = await Employee.find({ dashboardAccess: 'Manager Dashboard' }).select('_id');
      const managerIds = managers.map(m => m._id);

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const upcomingManagerTask = await Task.findOne({
        assignedTo: { $in: managerIds },
        status: { $nin: ['Completed', 'Not Completed'] },
        dueDate: { $gte: today }
      })
      .sort({ dueDate: 1 })
      .populate('assignedTo', 'name');

      res.status(200).json({ 
        totalEmployees, 
        upcomingManagerTask,
        totalTasks,
        tasksPendingVerification
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ message: 'Server error while fetching stats.' });
    }
  };

  /**
   * @description Get dashboard statistics for a specific manager's team
   * @route GET /api/manager-stats/:managerId
   * @access Manager
   */
  static getManagerDashboardStats = async (req, res) => {
    try {
      const { managerId } = req.params;

      // Find all employees who report to this manager
      const teamMembers = await Employee.find({ teamLead: managerId });
      const teamMemberIds = teamMembers.map(member => member._id);
      const teamMemberCount = teamMembers.length;

      // Find all reports submitted by the team members
      const teamReports = await Report.find({ employee: { $in: teamMemberIds } });

      const taskStats = {
        completed: 0,
        inProgress: 0,
        pending: 0,
      };

      teamReports.forEach(report => {
        try {
          const content = JSON.parse(report.content);
          if (content.tasks && Array.isArray(content.tasks)) {
            content.tasks.forEach(task => {
              if (task.status === 'Completed') {
                taskStats.completed++;
              } else if (task.status === 'In Progress') {
                taskStats.inProgress++;
              } else {
                taskStats.pending++;
              }
            });
          }
        } catch (e) { /* Ignore reports with invalid JSON */ }
      });

      res.status(200).json({ teamMemberCount, taskStats });
    } catch (error) {
      console.error('Error fetching manager dashboard stats:', error);
      res.status(500).json({ message: 'Server error while fetching manager stats.' });
    }
  };
  /**
   * @description Get all employees
   * @route GET /api/employees
   * @access Admin
   */
  static getAllEmployees = async (req, res) => {
    try {
      // Use aggregation to join employees with their assignments
      const employees = await Employee.aggregate([
        // Stage 1: Filter out the admin user
        {
          $match: { role: { $ne: 'Admin' } }
        },
        {
          $project: { password: 0 }
        },
        // Stage 2: Left join with the 'assignments' collection
        {
          $lookup: {
            from: 'assignments', // The collection to join with
            localField: '_id', // Field from the Employee collection
            foreignField: 'employee', // Field from the Assignment collection
            as: 'assignmentInfo' // The new array field to add
          }
        },
        // Stage 3: Deconstruct the assignmentInfo array
        {
          $unwind: { path: '$assignmentInfo', preserveNullAndEmptyArrays: true }
        },
        // Stage 4: Join with the 'employees' collection again to get the team lead's name
        {
          $lookup: {
            from: 'employees',
            localField: 'assignmentInfo.teamLead',
            foreignField: '_id',
            as: 'teamLeadInfo'
          }
        },
        // Stage 5: Shape the final output
        {
          $project: {
            _id: 1, name: 1, email: 1, role: 1, employeeId: 1, 
            profilePicture: 1, address: 1, gender: 1, country: 1, city: 1, qualification: 1, dashboardAccess: 1, department: 1, experience: 1, workType: 1, company: 1, joiningDate: 1, workLocation: 1, shift: 1, 
            canEditProfile: 1, canViewTeam: 1, canUpdateTask: 1, canApproveTask: 1, canAssignTask: 1, canDeleteTask: 1, canViewAnalytics: 1,
            // Use the department from assignment if available, otherwise fall back to the one on the employee record
            department: { $ifNull: [ '$assignmentInfo.department', '$department' ] },
            teamLead: { $arrayElemAt: ['$teamLeadInfo', 0] }
          }
        },
        // Stage 6: Sort by creation date
        { $sort: { createdAt: -1 } }
      ]);
      res.status(200).json(employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      res.status(500).json({ message: 'Server error while fetching employees.' });
    }
  };

  /**
   * @description Get candidates for Employee of the Month based on task completion categories
   * @route GET /api/employees/employee-of-the-month
   * @access Admin
   */
  static getEmployeeOfTheMonthCandidates = async (req, res) => {
    const { month, year } = req.query; // Month is 1-indexed (1-12)

    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required.' });
    }

    const startOfMonth = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1));
    const endOfMonth = new Date(Date.UTC(parseInt(year), parseInt(month), 0, 23, 59, 59, 999));

    try {
      const tasks = await Task.find({
        completionDate: { $gte: startOfMonth, $lte: endOfMonth },
        status: { $in: ['Completed', 'Not Completed'] }
      }).populate('assignedTo', 'name profilePicture employeeId company');

      const employeePerformance = {};

      tasks.forEach(task => {
        
        if (!task.assignedTo) return; // Skip tasks without an assignee
        const employeeId = task.assignedTo._id.toString();
        if (!employeePerformance[employeeId]) {
          employeePerformance[employeeId] = {
            employee: task.assignedTo,
            totalProgress: 0,
            totalTasks: 0,
            totalEarliness: 0,
            completedTasksCount: 0,
          };
        }

        employeePerformance[employeeId].totalProgress += task.progress || 0;
        employeePerformance[employeeId].totalTasks++;
        if (task.status === 'Completed' && task.dueDate && task.completionDate) {
          employeePerformance[employeeId].totalEarliness += new Date(task.dueDate) - new Date(task.completionDate);
          employeePerformance[employeeId].completedTasksCount++;
        }
      });

      const candidates = Object.values(employeePerformance).map(perf => {
        const averageProgress = perf.totalTasks > 0 ? perf.totalProgress / perf.totalTasks : 0;
        const averageEarliness = perf.completedTasksCount > 0 ? perf.totalEarliness / perf.completedTasksCount : 0;
        return {
          ...perf,
          averageProgress,
          averageEarliness, // in milliseconds
        };
      });

      const sortedCandidates = candidates.sort((a, b) => {
        if (b.averageProgress !== a.averageProgress) {
          return b.averageProgress - a.averageProgress;
        }
        return b.averageEarliness - a.averageEarliness;
      });

      const topCandidates = sortedCandidates.slice(0, 10).map(candidate => {
        const { employee, totalTasks, averageProgress, averageEarliness } = candidate;
        let reason = '';
        const hoursEarly = averageEarliness > 0 ? (averageEarliness / (1000 * 60 * 60)).toFixed(1) : 0;

        if (totalTasks > 0) {
          reason = `${employee.name} achieved an average completion of ${averageProgress.toFixed(2)}% across ${totalTasks} tasks, finishing work on average ${hoursEarly} hours ahead of schedule.`;
        } else {
          reason = 'No completed tasks found for this period.';
        }

        return {
          employee,
          totalScore: averageProgress, // Use averageProgress as the score
          totalTasks,
          reason,
          averageEarliness,
        };
      });

      res.status(200).json(topCandidates);
    } catch (error) {
      console.error('Error fetching employee of the month candidates:', error);
      res.status(500).json({ message: 'Server error while fetching candidates.' });
    }
  };

  /**
   * @description Set an employee as the Employee of the Month for a specific company.
   * @route POST /api/employees/employee-of-the-month
   * @access Admin
   */
  static setEmployeeOfTheMonth = async (req, res) => {
    const { employeeId, company, month, year, score } = req.body;

    if (!employeeId || !company || !month || !year || score === undefined) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
      const winner = await EmployeeOfMonth.findOneAndUpdate(
        { company, month, year },
        { employee: employeeId, company, month, year, score },
        { new: true, upsert: true, runValidators: true }
      ).populate('employee', 'name profilePicture employeeId company');

      // Deactivate previous EOM announcements for the same company
      await Announcement.updateMany(
        { company: winner.company, title: { $regex: /Employee of the Month/ } },
        { isActive: false }
      );

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7); // Set to expire in 7 days

      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const monthName = monthNames[month - 1];

      await Announcement.create({
        title: `🏆 Employee of the Month for ${monthName}!`,
        content: `Congratulations to ${winner.employee.name} from ${winner.employee.company} for their outstanding performance!`,
        createdBy: req.user._id,
        company: winner.company, // Scope the announcement to the winner's company
        relatedEmployee: winner.employee._id,
        expiresAt: expiryDate,
      });

      res.status(201).json(winner);
    } catch (error) {
      console.error('Error setting employee of the month:', error);
      res.status(500).json({ message: 'Server error while setting winner.' });
    }
  };

  /**
   * @description Get the official Employees of the Month for a given period.
   * @route GET /api/employees/official-eom
   * @access Private
   */
  static getOfficialEOM = async (req, res) => {
    const { month, year } = req.query;
    try {
      const winners = await EmployeeOfMonth.find({ month, year }).populate('employee', 'name profilePicture employeeId company');
      res.status(200).json(winners);
    } catch (error) {
      res.status(500).json({ message: 'Server error while fetching official winners.' });
    }
  };

  /**
   * @description Get all past Employee of the Month winners for a Hall of Fame.
   * @route GET /api/employees/hall-of-fame
   * @access Private
   */
  static getHallOfFame = async (req, res) => {
    try {
      const allWinners = await EmployeeOfMonth.find({}).sort({ year: -1, month: -1 }).populate('employee', 'name profilePicture employeeId company');

      const hallOfFameData = allWinners.reduce((acc, winner) => {
        const { year, month } = winner;
        if (!acc[year]) acc[year] = {};
        if (!acc[year][month]) acc[year][month] = [];
        acc[year][month].push(winner);
        return acc;
      }, {});

      res.status(200).json(hallOfFameData);
    } catch (error) {
      console.error('Error fetching Hall of Fame data:', error);
      res.status(500).json({ message: 'Server error while fetching Hall of Fame data.' });
    }
  };

  /**
   * @description Get all Employee of the Month wins for a specific employee.
   * @route GET /api/employees/:employeeId/eom-history
   * @access Private
   */
  static getEmployeeEOMHistory = async (req, res) => {
    const { employeeId } = req.params;
    try {
      const wins = await EmployeeOfMonth.find({ employee: employeeId }).sort({ year: -1, month: -1 });
      res.status(200).json(wins);
    } catch (error) {
      console.error('Error fetching employee EOM history:', error);
      res.status(500).json({ message: 'Server error while fetching EOM history.' });
    }
  };
}

module.exports = ManageEmployeeController;