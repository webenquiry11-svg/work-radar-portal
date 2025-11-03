const Task = require('../models/task.js');
const Report = require('../models/report.js');
const Notification = require('../models/notification.js');

class TaskController {
  static createTask = async (req, res) => {
    const { title, description, assignedTo, startDate, dueDate, priority } = req.body;
    const assignedBy = req.user._id;

    if (!title || !assignedTo) {
      return res.status(400).json({ message: 'Title and assignedTo are required.' });
    }

    try {
      const task = new Task({
        title,
        description,
        assignedTo,
        assignedBy,
        startDate,
        dueDate,
        priority,
      });
      await task.save();
      res.status(201).json({ message: 'Task created successfully', task });
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ message: 'Server error while creating task.' });
    }
  };

  static createMultipleTasks = async (req, res) => {
    const tasksData = req.body.tasks; // Expect an array of tasks
    const assignedBy = req.user._id;

    if (!Array.isArray(tasksData) || tasksData.length === 0) {
      return res.status(400).json({ message: 'An array of tasks is required.' });
    }

    try {
      const tasksToInsert = tasksData.map(task => ({
        ...task,
        assignedBy,
      }));

      const createdTasks = await Task.insertMany(tasksToInsert);

      res.status(201).json({ message: `${createdTasks.length} tasks created successfully`, tasks: createdTasks });
    } catch (error) {
      console.error('Error creating multiple tasks:', error);
      res.status(500).json({ message: 'Server error while creating tasks.' });
    }
  };

  static getMyTasks = async (req, res) => {
    try {
      const tasks = await Task.find({ assignedTo: req.user._id })
        .populate('assignedBy', 'name')
        .populate({
          path: 'comments',
          populate: {
            path: 'author',
            select: 'name profilePicture'
          }
        })
        .sort({ createdAt: -1 });
      res.status(200).json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ message: 'Server error while fetching tasks.' });
    }
  };

  static getAllTasks = async (req, res) => {
    try {
      const tasks = await Task.find({})
        .populate('assignedTo', 'name employeeId')
        .populate('assignedBy', 'name employeeId')
        .populate({
          path: 'comments',
          populate: {
            path: 'author',
            select: 'name profilePicture'
          }
        })
        .sort({ createdAt: -1 });
      res.status(200).json(tasks);
    } catch (error) {
      console.error('Error fetching all tasks:', error);
      res.status(500).json({ message: 'Server error while fetching all tasks.' });
    }
  };

  static updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, description, dueDate, priority, status } = req.body;
    const updaterId = req.user._id;

    try {
      const task = await Task.findById(id).populate('assignedTo', 'name');

      if (!task) {
        return res.status(404).json({ message: 'Task not found.' });
      }

      // Allow the user who assigned the task OR the user it is assigned to, to update it.
      const isAssignee = task.assignedTo._id.toString() === updaterId.toString();
      const isAssigner = task.assignedBy.toString() === updaterId.toString();
      const isAdmin = req.user.role === 'Admin';

      // Prevent status updates on finally graded tasks
      if (isAssignee && status && ['Completed', 'Not Completed'].includes(task.status)) {
        return res.status(403).json({ message: 'This task has already been graded and cannot be modified.' });
      }

      // An assignee can only update the status field.
      const canUpdate = isAdmin || (isAssigner && req.user.canUpdateTask);

      if (isAssignee && (title || description || dueDate || priority)) {
        return res.status(403).json({ message: 'You are only authorized to update the status of this task.' });
      } else if (!isAssignee && !canUpdate) {
        return res.status(403).json({ message: 'You are not authorized to update this task.' });
      }

      task.title = title || task.title;
      task.description = description || task.description;
      task.dueDate = dueDate || task.dueDate;
      task.priority = priority || task.priority;
      task.status = status || task.status;

      const updatedTask = await task.save();

      // If the status is 'Pending Verification', create a notification for the direct team lead
      if (status === 'Pending Verification') {
        const employee = await Employee.findById(task.assignedTo).populate('teamLead');
        if (employee && employee.teamLead) {
          await Notification.create({
            recipient: employee.teamLead._id,
            subjectEmployee: employee._id,
            type: 'task_approval',
            message: `${employee.name} has submitted a task for your approval: "${task.title}"`,
            relatedTask: task._id,
          });
        }
      }

      res.status(200).json({ message: 'Task updated successfully', task: updatedTask });
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ message: 'Server error while updating task.' });
    }
  };

  static approveTaskCompletion = async (req, res) => {
    const { id } = req.params;
    const { finalPercentage, comment } = req.body;
    const approverId = req.user._id;

    try {
      const task = await Task.findById(id).populate('assignedTo', 'name');
      if (!task) {
        return res.status(404).json({ message: 'Task not found.' });
      }
      if (task.assignedBy.toString() !== approverId.toString() && req.user.role !== 'Admin' && !req.user.canApproveTask) {
        return res.status(403).json({ message: 'You are not authorized to approve this task.' });
      }

      const finalProgress = parseInt(finalPercentage, 10);

      // Set completion category based on the manager's final percentage
      if (finalProgress === 100) {
        task.completionCategory = 'Completed';
      } else if (finalProgress >= 80) {
        task.completionCategory = 'Moderate';
      } else if (finalProgress >= 60) {
        task.completionCategory = 'Low';
      } else {
        task.completionCategory = 'Pending';
      }

      if (finalProgress < 100) {
        task.status = 'Not Completed';
      } else {
        task.status = 'Completed';
      }
      task.completionDate = task.submittedForCompletionDate || new Date();
      task.progress = finalProgress;
      task.rejectionReason = ''; // Clear any previous rejection reason

      // If there's a comment, add it to the task
      if (comment && comment.trim() !== '') {
        task.comments.push({
          text: `Approval comment: ${comment}`,
          author: approverId,
        });
      }

      await task.save();

      // Create a notification for the employee
      await Notification.create({
        recipient: task.assignedTo,
        subjectEmployee: approverId,
        message: `Your task "${task.title}" has been approved with a final grade of ${task.completionCategory}.`,
        type: 'info',
        relatedTask: task._id,
        isRead: false,
      });

      // After approval, delete the corresponding 'task_approval' notification
      await Notification.findOneAndDelete({
        relatedTask: task._id,
        type: 'task_approval',
      });

      res.status(200).json({ message: 'Task approved successfully.', task });
    } catch (error) {
      console.error('Error approving task:', error);
      res.status(500).json({ message: 'Server error while approving task.' });
    }
  };

  static rejectTaskCompletion = async (req, res) => {
    const { id } = req.params;
    const { reason, finalPercentage } = req.body;
    const rejectorId = req.user._id;

    if (!reason || finalPercentage === undefined) {
      return res.status(400).json({ message: 'A reason and final percentage are required for rejection.' });
    }

    try {
      const task = await Task.findById(id).populate('assignedTo', 'name');
      if (!task) {
        return res.status(404).json({ message: 'Task not found.' });
      }
      if (task.assignedBy.toString() !== rejectorId.toString() && req.user.role !== 'Admin' && !req.user.canApproveTask) {
        return res.status(403).json({ message: 'You are not authorized to reject this task.' });
      }

      const finalProgress = parseInt(finalPercentage, 10);

      // Set completion category based on the manager's final percentage
      if (finalProgress >= 95) { // Let's consider 95-100 as completed
        task.completionCategory = 'Completed';
      } else if (finalProgress >= 75) {
        task.completionCategory = 'Moderate';
      } else if (finalProgress >= 60) {
        task.completionCategory = 'Low';
      } else {
        task.completionCategory = 'Pending';
      }

      // Set final status based on progress
      if (finalProgress < 95) {
        task.status = 'Not Completed';
      } else {
        task.status = 'Completed';
      }

      task.completionDate = task.submittedForCompletionDate || new Date();
      task.progress = finalProgress;
      task.rejectionReason = reason;
      task.comments.push({
        text: `Task reviewed and graded with progress set to ${task.progress}%. Reason: ${reason}`,
        author: rejectorId,
      });
      await task.save();

      await Notification.create({
        recipient: task.assignedTo,
        subjectEmployee: rejectorId,
        message: `Your task "${task.title}" has been reviewed. Final progress: ${finalProgress}%. Reason: ${reason}`,
        type: 'info',
        relatedTask: task._id,
      });

      // After rejection, delete the corresponding 'task_approval' notification
      await Notification.findOneAndDelete({
        relatedTask: task._id,
        type: 'task_approval',
      });

      res.status(200).json({ message: 'Task rejected successfully.', task });
    } catch (error) {
      console.error('Error rejecting task:', error);
      res.status(500).json({ message: 'Server error while rejecting task.' });
    }
  };

  static deleteTask = async (req, res) => {
    const { id } = req.params;

    if (req.user.role !== 'Admin' && !req.user.canDeleteTask) {
      return res.status(403).json({ message: 'You are not authorized to delete tasks.' });
    }

    try {
      const task = await Task.findById(id);

      if (!task) {
        return res.status(404).json({ message: 'Task not found.' });
      }

      await task.deleteOne();
      res.status(200).json({ message: 'Task deleted successfully.' });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ message: 'Server error while deleting task.' });
    }
  };

  /**
   * @description Add a comment to a task
   * @route POST /api/tasks/:id/comments
   * @access Private
   */
  static addTaskComment = async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;
    const authorId = req.user._id;

    if (!text) {
      return res.status(400).json({ message: 'Comment text is required.' });
    }

    try {
      const task = await Task.findById(id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found.' });
      }

      const comment = { author: authorId, text };
      task.comments.push(comment);
      await task.save();

      // Notify the other party
      const recipientId = task.assignedTo.toString() === authorId.toString()
        ? task.assignedBy
        : task.assignedTo;

      await Notification.create({
        recipient: recipientId,
        subjectEmployee: authorId,
        message: `${req.user.name} commented on the task: "${task.title}"`,
        type: 'info',
        relatedTask: task._id,
      });

      const populatedTask = await Task.findById(id).populate('comments.author', 'name profilePicture');
      res.status(201).json(populatedTask);
    } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({ message: 'Server error while adding comment.' });
    }
  };

  /**
   * @description Transition tasks that are past their due date to 'Pending Verification'
   * @route POST /api/tasks/process-due-tasks
   * @access Private
   */
  static processPastDueTasks = async (req, res) => {
    try {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const pastDueTasks = await Task.find({
        dueDate: { $lt: today },
        status: { $in: ['Pending', 'In Progress'] }
      }).populate('assignedTo', 'name');

      for (const task of pastDueTasks) {
        // Check if an approval notification already exists for this task
        const existingNotification = await Notification.findOne({
          relatedTask: task._id,
          type: 'task_approval'
        });
        
        // If a notification for this task's approval already exists, skip to avoid duplicates.
        if (existingNotification) {
          continue;
        }

        // If no approval notification exists, update the status and create one.
        task.status = 'Pending Verification';
        task.submittedForCompletionDate = new Date(); // Set submission date to now
        await task.save();

        // Find the employee's team lead to send the notification
        const employee = await Employee.findById(task.assignedTo._id).populate('teamLead');
        const notifications = [];
        const message = `The due date for the task "${task.title}" assigned to ${employee.name} has passed. It is now ready for your review.`;

        // 1. Notify the direct team lead (if they exist)
        if (employee && employee.teamLead) {
          notifications.push({
            recipient: employee.teamLead._id,
            subjectEmployee: employee._id,
            message: message,
            type: 'task_approval',
            relatedTask: task._id,
          });
        }

        // 2. Notify all Admins
        const admins = await Employee.find({ role: 'Admin' }).select('_id');
        admins.forEach(admin => notifications.push({ recipient: admin._id, subjectEmployee: employee._id, message: message, type: 'task_approval', relatedTask: task._id }));

        // Insert all notifications if any were created
        if (notifications.length > 0) await Notification.insertMany(notifications);
      }
      res.status(200).json({ message: `${pastDueTasks.length} past-due tasks processed.` });
    } catch (error) {
      console.error('Error processing past-due tasks:', error);
      res.status(500).json({ message: 'Server error while processing past-due tasks.' });
    }
  };
}

module.exports = TaskController;