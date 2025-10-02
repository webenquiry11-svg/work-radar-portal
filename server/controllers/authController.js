const Employee = require('../models/employee.js');
const generateToken = require('../generateToken.js');

class AuthController {
  static login = async (req, res) => {
    const { employeeId, password } = req.body;
    try {
      const user = await Employee.findOne({ employeeId });

      if (user && (await user.matchPassword(password))) {
        res.json({
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            dashboardAccess: user.dashboardAccess,
            canEditProfile: user.canEditProfile,
            canViewTeam: user.canViewTeam,
            canApproveTask: user.canApproveTask,
            canAssignTask: user.canAssignTask,
            canDeleteTask: user.canDeleteTask,
            canViewAnalytics: user.canViewAnalytics,
            profilePicture: user.profilePicture,
            company: user.company,
          },
          token: generateToken(user._id),
        });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };

  static getMe = async (req, res) => {
    res.status(200).json(req.user);
  };
}

module.exports = AuthController;