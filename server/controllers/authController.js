const Employee = require('../models/employee.js');
const generateToken = require('../generateToken.js');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

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
   * @description Generate and email a password reset token.
   * @route POST /api/auth/forgot-password
   * @access Private (Admin only for their own account)
   */
  static forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
      const user = await Employee.findOne({ email });

      if (!user) {
        // Security best practice: don't reveal if the user exists or not.
        return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
      }

      // Create a short-lived reset token
      const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
      await user.save();

      // Create reset URL
      const resetUrl = `${req.protocol}://${req.get('host').replace('/workradar/api', '')}/reset-password/${resetToken}`;

      const message = `
        <p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
        <p>Please click on the following link, or paste it into your browser to complete the process:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 15 minutes.</p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      `;

      // Setup nodemailer transporter (ensure credentials are in your .env file)
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE, // e.g., 'gmail'
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `Work Radar <${process.env.EMAIL_FROM}>`,
        to: user.email,
        subject: 'Password Reset Request',
        html: message,
      });

      res.status(200).json({ message: 'Password reset email sent.' });
    } catch (error) {
      console.error('Forgot Password Error:', error);
      // Clear token on error to allow retries
      if (req.body.email) {
        const user = await Employee.findOne({ email: req.body.email });
        if (user) {
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;
          await user.save();
        }
      }
      res.status(500).json({ message: 'Error sending password reset email.' });
    }
  };

  /**
   * @description Reset password using a token.
   * @route PUT /api/auth/reset-password/:token
   * @access Public
   */
  static resetPassword = async (req, res) => {
    // This controller will be implemented in the next step.
    // For now, we'll just add the route.
    res.status(501).json({ message: 'Not Implemented' });
  };
}

module.exports = AuthController;