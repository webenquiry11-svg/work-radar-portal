const Employee = require('../models/employee.js');
const generateToken = require('../generateToken.js');
const crypto = require('crypto');
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

      // Create a secure reset token
      const resetToken = crypto.randomBytes(20).toString('hex');

      user.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
      await user.save();

      // Create reset URL (adjust the base URL for your production environment)
      const resetUrl = `${req.protocol}://${req.get('host').replace('/workradar/api', '')}/workradar/reset-password/${resetToken}`;

      const message = `
        <p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
        <p>Please click on the following link, or paste it into your browser to complete the process:</p>
        <p><a href="${resetUrl}" target="_blank">${resetUrl}</a></p>
        <p>This link will expire in 15 minutes.</p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      `;

      // Setup nodemailer transporter (ensure credentials are in your .env file)
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Work Radar - Password Reset Request',
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
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    try {
      const user = await Employee.findOne({
        resetPasswordToken,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
      }

      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.status(200).json({ message: 'Password reset successful.' });
    } catch (error) {
      res.status(500).json({ message: 'Error resetting password.' });
    }
  };
}

module.exports = AuthController;