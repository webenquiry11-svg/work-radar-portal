const cron = require('node-cron');
const Employee = require('../models/employee.js');
const Report = require('../models/report.js');
const Notification = require('../models/notification.js');
const Holiday = require('../models/holiday.js');
const Leave = require('../models/leave.js');

const findManagementChain = async (employeeId, employees) => {
  const managers = [];
  let currentEmployee = employees.find(e => e._id.toString() === employeeId.toString());

  while (currentEmployee && currentEmployee.teamLead) {
    const manager = employees.find(e => e._id.toString() === currentEmployee.teamLead._id.toString());
    if (manager) {
      managers.push(manager);
      currentEmployee = manager;
    } else {
      break; // No more managers up the chain
    }
  }
  return managers;
};

const checkOverdueReports = async () => {
  console.log('Running daily report check...');
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Check if today is Sunday (getDay() returns 0 for Sunday)
  if (today.getDay() === 0) {
    console.log(`Skipping report check: Today (${today.toLocaleDateString()}) is Sunday.`);
    return;
  }

  // Check if today is a holiday
  const isHoliday = await Holiday.findOne({ date: today });
  if (isHoliday) {
    console.log(`Skipping report check: Today (${today.toLocaleDateString()}) is a holiday: ${isHoliday.name}.`);
    return;
  }

  try {
    // Fetch all employees with their team lead info
    const allEmployees = await Employee.find({ role: { $ne: 'Admin' } }).populate('teamLead', '_id');
    // Also fetch all admin users to notify them
    const admins = await Employee.find({ role: 'Admin' });

    for (const employee of allEmployees) {
      // First, check if the employee is on personal leave today. This has high priority.
      const onLeave = await Leave.findOne({ employee: employee._id, date: today });
      if (onLeave) {
        console.log(`Skipping notification for ${employee.name}: On personal leave.`);
        continue; // Skip to the next employee
      }

      const report = await Report.findOne({
        employee: employee._id,
        reportDate: today,
        status: 'Submitted'
      });

      // If no submitted report is found for today
      if (!report) {
        console.log(`No submitted report for ${employee.name}. Finding managers...`);
        const managementChain = await findManagementChain(employee._id, allEmployees);

        const recipients = [...managementChain, ...admins];
        const uniqueRecipients = Array.from(new Map(recipients.map(item => [item._id.toString(), item])).values());

        if (uniqueRecipients.length > 0) {
          const message = `${employee.name} has not submitted their report for ${today.toLocaleDateString()}.`;
          const newNotifications = uniqueRecipients.map(recipient => ({
              recipient: recipient._id,
              subjectEmployee: employee._id,
              message: message,
              type: 'report_overdue',
              notificationDate: today // 'today' is already set to the start of the day UTC
          }));

          // The unique index on the Notification model will prevent duplicates for the same day.
          // Using ordered: false ensures that if one notification fails (e.g., duplicate), the others are still inserted.
          await Notification.insertMany(newNotifications, { ordered: false }).catch(err => {
            // We can ignore duplicate key errors (code 11000) as they are expected.
            if (err.code !== 11000) console.error('Error inserting overdue notifications:', err);
          });
          console.log(`Attempted to send overdue report notifications for ${employee.name}.`);
        }
      }
    }
  } catch (error) {
    console.error('Error during daily report check:', error);
  }
};

// Schedule the job to run every day at 7:05 PM
cron.schedule('5 19 * * *', checkOverdueReports);