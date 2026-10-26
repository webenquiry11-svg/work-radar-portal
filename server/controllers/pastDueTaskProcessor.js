const Task = require('../models/task.js');
const Notification = require('../models/notification.js');
const Employee = require('../models/employee.js');
const Assignment = require('../models/assignment.js');

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const getDueDateCutoff = (now = new Date()) => {
  const istNow = new Date(now.getTime() + IST_OFFSET_MS);
  const istDayStart = Date.UTC(
    istNow.getUTCFullYear(),
    istNow.getUTCMonth(),
    istNow.getUTCDate()
  ) - IST_OFFSET_MS;
  const isEndOfDay = istNow.getUTCHours() >= 21;

  return new Date(istDayStart + (isEndOfDay ? DAY_MS : 0));
};

const processPastDueTasks = async () => {
  const dueDateCutoff = getDueDateCutoff();
  const eligibleTaskFilter = {
    dueDate: { $lt: dueDateCutoff },
    status: { $in: ['Pending', 'In Progress'] },
    $or: [
      { rejectionReason: { $exists: false } },
      { rejectionReason: '' },
      { rejectionReason: null },
    ],
  };
  const taskRefs = await Task.find(eligibleTaskFilter).select('_id');
  let processedCount = 0;

  for (const taskRef of taskRefs) {
    const task = await Task.findOneAndUpdate(
      { _id: taskRef._id, ...eligibleTaskFilter },
      {
        $set: {
          status: 'Pending Verification',
          submittedForCompletionDate: new Date(),
        },
      },
      { new: true }
    ).populate('assignedTo', 'name');

    if (!task) continue;

    if (!task.assignedTo) {
      console.log(`Skipping past-due processing for task ${task._id}: no assignee.`);
      continue;
    }

    const employee = await Employee.findById(task.assignedTo._id);
    if (!employee) {
      console.log(`Skipping notification for task ${task._id}: assigned employee not found.`);
      continue;
    }

    const message = `The due date for the task "${task.title}" assigned to ${employee.name} has been reached. It has been automatically submitted for review. Final Progress: ${task.progress}%.`;
    const recipientIds = new Set();
    if (task.assignedBy) recipientIds.add(task.assignedBy.toString());

    const assignment = await Assignment.findOne({ employee: task.assignedTo._id });
    if (assignment && assignment.teamLead) {
      recipientIds.add(assignment.teamLead.toString());
    }

    const admins = await Employee.find({ role: 'Admin' }).select('_id');
    admins.forEach(admin => recipientIds.add(admin._id.toString()));
    recipientIds.delete(task.assignedTo._id.toString());

    const notifications = Array.from(recipientIds).map(id => ({
      recipient: id,
      subjectEmployee: employee._id,
      message,
      type: 'task_approval',
      relatedTask: task._id,
    }));

    if (notifications.length > 0) {
      try {
        await Notification.insertMany(notifications, { ordered: false });
      } catch (error) {
        if (error.code !== 11000) {
          console.error('Error sending notifications:', error);
        }
      }
    }
    processedCount++;
  }

  return processedCount;
};

module.exports = { getDueDateCutoff, processPastDueTasks };
