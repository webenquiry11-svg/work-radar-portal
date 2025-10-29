const Employee = require('../models/employee.js');
const generateToken = require('../generateToken.js');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail.js');

class AuthController {
  static login = async (req, res) => {
    const { employeeId, password } = req.body;
    try {
      const user = await Employee.findOne({ employeeId });

      if (user && (await user.matchPassword(password))) {
        res.json({
          // Return the user object, but exclude the password
          user: await Employee.findById(user._id).select('-password'),
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

  /**
   * @description Handle forgot password request
   * @route POST /api/auth/forgot-password
   * @access Public
   */
  static forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
      const user = await Employee.findOne({ email });
      if (!user) {
        // Send a generic success message to prevent user enumeration
        return res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent.' });
      }

      // Create a short-lived reset token
      const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

      // Construct the reset URL pointing to your frontend application
      const resetUrl = `${process.env.FRONTEND_URLS.split(',')[0]}/reset-password/${resetToken}`;
      
      const message = `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste it into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\nThis link is valid for 15 minutes.`;

      await sendEmail({
        email: user.email,
        subject: 'Your Work Radar Password Reset Token',
        message,
      });

      console.log(`Password Reset Link Sent to: ${user.email}`);

      res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent.' });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Server error while processing forgot password request.' });
    }
  };

  /**
   * @description Handle password reset
   * @route POST /api/auth/reset-password/:token
   * @access Public
   */
  static resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await Employee.findById(decoded.id);
      if (!user) {
        return res.status(400).json({ message: 'Invalid token or user does not exist.' });
      }
      user.password = password; // The 'save' pre-hook will hash it
      await user.save();
      res.status(200).json({ message: 'Password reset successfully.' });
    } catch (error) {
      res.status(400).json({ message: 'Invalid or expired token.' });
    }
  };
}

module.exports = AuthController;