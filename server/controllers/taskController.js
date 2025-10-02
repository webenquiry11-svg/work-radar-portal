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
      const task = await Task.findById(id);

      if (!task) {
        return res.status(404).json({ message: 'Task not found.' });
      }

      // Allow the user who assigned the task OR the user it is assigned to, to update it.
      const isAssignee = task.assignedTo.toString() === updaterId.toString(); 
      const isAssignerWithPermission = task.assignedBy.toString() === updaterId.toString() && req.user.canUpdateTask; 
      const isAdmin = req.user.role === 'Admin';

      // An assignee can only update the status field.
      if (isAssignee && (Object.keys(req.body).length > 1 || !req.body.status)) {
        return res.status(403).json({ message: 'You are only authorized to update the status of this task.' });
      } else if (!isAssignee && !isAssignerWithPermission && !isAdmin) { 
        // An assigner can only edit if they have permission. An admin can always edit. 
        return res.status(403).json({ message: 'You are not authorized to update this task.' });
      }

      task.title = title || task.title;
      task.description = description || task.description;
      task.dueDate = dueDate || task.dueDate;
      task.priority = priority || task.priority;
      task.status = status || task.status;

      const updatedTask = await task.save();
      res.status(200).json({ message: 'Task updated successfully', task: updatedTask });
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ message: 'Server error while updating task.' });
    }
  };

  static approveTaskCompletion = async (req, res) => {
    const { id } = req.params;
    const approverId = req.user._id;

    try {
      const task = await Task.findById(id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found.' });
      }
      if (task.assignedBy.toString() !== approverId.toString()) {
        return res.status(403).json({ message: 'You are not authorized to approve this task.' });
      }

      // Find the latest report for this task to get the completion percentage.
      const reports = await Report.find({ employee: task.assignedTo }).sort({ reportDate: -1 });
      let finalCompletion = 0;

      for (const report of reports) {
        try {
          const content = JSON.parse(report.content);
          if (content.taskUpdates) {
            const taskUpdate = content.taskUpdates.find(u => u.taskId.toString() === id);
            if (taskUpdate) {
              finalCompletion = parseInt(taskUpdate.completion, 10);
              break; // Found the latest update for this task
            }
          }
        } catch (e) { /* ignore */ }
      }

      // Set completion category based on the final percentage
      if (finalCompletion === 100) {
        task.completionCategory = 'Completed';
      } else if (finalCompletion >= 80) {
        task.completionCategory = 'Moderate';
      } else if (finalCompletion >= 60) {
        task.completionCategory = 'Low';
      } else {
        task.completionCategory = 'Pending';
      }

      task.status = 'Completed';
      task.completionDate = new Date();
      task.rejectionReason = ''; // Clear any previous rejection reason
      await task.save();

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
      const task = await Task.findById(id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found.' });
      }
      if (task.assignedBy.toString() !== rejectorId.toString()) {
        return res.status(403).json({ message: 'You are not authorized to reject this task.' });
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

      task.status = 'Completed'; // The task is now considered done, but with a specific grade.
      task.rejectionReason = reason;
      task.progress = finalProgress;
      await task.save();

      // Notify the employee about the rejection and reopened report.
      await Notification.create({
        recipient: task.assignedTo,
        subjectEmployee: rejectorId,
        message: `Your task "${task.title}" was reviewed. Final progress was set to ${finalProgress}%. Reason: ${reason}`,
        type: 'info',
        relatedTask: task._id,
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
        task.status = 'Pending Verification';
        await task.save();

        await Notification.create({
          recipient: task.assignedBy,
          subjectEmployee: task.assignedTo,
          message: `The due date for the task "${task.title}" assigned to ${task.assignedTo.name} has passed. It is now ready for your review.`,
          type: 'task_approval',
          relatedTask: task._id,
        });
      }
      res.status(200).json({ message: `${pastDueTasks.length} past-due tasks processed.` });
    } catch (error) {
      console.error('Error processing past-due tasks:', error);
      res.status(500).json({ message: 'Server error while processing past-due tasks.' });
    }
  };
}

module.exports = TaskController;