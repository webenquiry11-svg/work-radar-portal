const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create a transporter using your SMTP service
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
      user: 'webenquiry11@gmail.com',
      pass:  'jagrnaovvpvyvdqa',
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'Work Radar Support <support@workradar.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3) Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;