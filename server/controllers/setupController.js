const Employee = require('../models/employee.js');

class SetupController {
  /**
   * @description Check if the initial admin setup has been completed.
   * @route GET /api/setup/check
   * @access Public
   */
  static checkSetup = async (req, res) => {
    try {
      const adminCount = await Employee.countDocuments({ dashboardAccess: 'Admin Dashboard' });
      res.status(200).json({ setupNeeded: adminCount === 0 });
    } catch (error) {
      console.error('Error checking admin setup:', error);
      res.status(500).json({ message: 'Server error during setup check.' });
    }
  };

  /**
   * @description Create the initial admin account.
   * @route POST /api/setup/create-admin
   * @access Public
   */
  static createAdmin = async (req, res) => {
    try {
      const adminCount = await Employee.countDocuments({ dashboardAccess: 'Admin Dashboard' });
      if (adminCount > 0) {
        return res.status(403).json({ message: 'Admin account already exists.' });
      }

      const {
        name, email, password, employeeId, address, gender, country, city,
        qualification, experience, workType, company, workLocation, shift, department
      } = req.body;

      if (!name || !email || !password || !employeeId || !company || !department) {
        return res.status(400).json({ message: 'Please fill all required fields.' });
      }

      const profilePicture = req.file ? req.file.path : '';

      const admin = new Employee({
        name, email, password, employeeId, company, department,
        profilePicture, address, gender, country, city,
        qualification, experience, workType, workLocation, shift,
        role: 'Admin',
        dashboardAccess: 'Admin Dashboard',
        // Grant all permissions to the first admin by default
        canEditProfile: true,
        canViewTeam: true,
        canUpdateTask: true,
        canApproveTask: true,
        canAssignTask: true,
        canDeleteTask: true,
        canViewAnalytics: true,
      });

      await admin.save();

      res.status(201).json({ message: 'Admin account created successfully.' });
    } catch (error) {
      console.error('Error creating admin account:', error);
      res.status(500).json({ message: 'Server error during admin creation.' });
    }
  };
}

module.exports = SetupController;