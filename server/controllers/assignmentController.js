const Assignment = require('../models/assignment.js');
const Employee = require('../models/employee.js');

class AssignmentController {
  /**
   * @description Assign an employee to a department and team lead
   * @route PUT /api/employees/:id/assign
   * @access Admin
   */
  static assignEmployee = async (req, res) => {
    const { id } = req.params;
    const { department, teamLeadId } = req.body;

    if (!department || !teamLeadId) {
      return res.status(400).json({ message: 'Department and who they report to are required.' });
    }

    try {
      // Use findOneAndUpdate with upsert to create a new assignment or update an existing one.
      const assignment = await Assignment.findOneAndUpdate(
        { employee: id }, // find by employee's ID
        { employee: id, department, teamLead: teamLeadId }, // update with these values
        { new: true, upsert: true, runValidators: true } // options: return new doc, create if not found, run schema validation
      ).populate('employee', 'name').populate('teamLead', 'name');

      // Automatically grant team management permissions to the team lead
      await Employee.findByIdAndUpdate(teamLeadId, {
        $set: {
          canViewTeam: true,
          canAssignTask: true,
          canApproveTask: true,
          canViewAnalytics: true,
        }
      });

      res.status(200).json({ message: 'Employee assigned successfully', assignment });
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
      }
      console.error('Error assigning employee:', error);
      res.status(500).json({ message: 'Server error while assigning employee.' });
    }
  };

  /**
   * @description Unassign an employee
   * @route DELETE /api/employees/:id/unassign
   * @access Admin
   */
  static unassignEmployee = async (req, res) => {
    const { id } = req.params;

    try {
      const result = await Assignment.findOneAndDelete({ employee: id });
      if (!result) {
        return res.status(404).json({ message: 'No assignment found for this employee.' });
      }
      res.status(200).json({ message: 'Employee unassigned successfully.' });
    } catch (error) {
      console.error('Error unassigning employee:', error);
      res.status(500).json({ message: 'Server error while unassigning employee.' });
    }
  };
}

module.exports = AssignmentController;