import React, { useState, useMemo } from 'react';
import { useGetEmployeesQuery, useAssignEmployeeMutation, useUnassignEmployeeMutation } from '../services/EmployeApi';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon, ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const AssignmentTable = ({ employees, isLoading, onUnassign }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = useMemo(() =>
    employees.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.employeeId && employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [employees, searchTerm]);

  return (
  <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col h-full">
    <div className="p-6 border-b border-slate-200 flex-shrink-0">
        <h3 className="text-lg font-semibold text-slate-800">Current Employee Assignments</h3>
        <div className="relative mt-4">
          <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full sm:w-80 text-sm border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
    </div>
    <div className="overflow-y-auto">
      <table className="w-full text-sm text-left text-slate-500">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
          <tr>
            <th scope="col" className="px-4 py-3">Employee Name</th>
            <th scope="col" className="px-4 py-3">Department</th>
            <th scope="col" className="px-4 py-3">Reports To</th>
            <th scope="col" className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan="3" className="text-center p-6 text-slate-500">Loading assignments...</td></tr>
          ) : filteredEmployees.length > 0 ? (
            filteredEmployees.map(user => (
            <tr key={user._id} className="bg-white border-b hover:bg-slate-50 last:border-b-0">
              <td className="px-4 py-3 font-medium text-slate-900">{user.name} ({user.employeeId})</td>
              <td className="px-4 py-3">{user.department || <span className="text-slate-400">Not Assigned</span>}</td>
              <td className="px-4 py-3">{user.teamLead?.name || <span className="text-slate-400">N/A</span>}</td>
              <td className="px-4 py-3 text-right">
                {user.department && user.teamLead && (
                  <button onClick={() => onUnassign(user)} className="text-red-500 hover:text-red-700 font-semibold text-xs" title="Unassign employee">
                    Unassign
                  </button>
                )}
              </td>
            </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center p-6 text-slate-500">No employees found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
  );
};

const UnassignConfirmationModal = ({ isOpen, onClose, onConfirm, employee, isUnassigning }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
        <div className="p-6 text-center">
          <h3 className="text-lg font-semibold text-slate-800">Confirm Unassignment</h3>
          <div className="mx-auto bg-yellow-100 rounded-full h-12 w-12 flex items-center justify-center my-4">
            <ExclamationCircleIcon className="h-6 w-6 text-yellow-600" />
          </div>
          <p className="text-sm text-slate-500">Are you sure you want to unassign <strong className="text-slate-700">{employee?.name}</strong>? Their department and manager assignment will be removed.</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-b-lg flex justify-center gap-3">
          <button type="button" onClick={onClose} className="bg-white hover:bg-slate-100 text-slate-700 font-bold py-2 px-4 rounded-lg border border-slate-300 text-sm">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={isUnassigning} className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm disabled:bg-red-400">
            {isUnassigning && <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />}
            {isUnassigning ? 'Unassigning...' : 'Confirm Unassign'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AssignEmployee = () => {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedLead, setSelectedLead] = useState('');
  const [department, setDepartment] = useState('');
  const [formError, setFormError] = useState('');
  const [unassigningEmployee, setUnassigningEmployee] = useState(null);

  const departments = [
    'Corporate management', 
    'Human Resource', 
    'Creative Designing', 
    'Finance & Accounts', 
    'Marketing Operations', 
    'Sales & Marketing', 
    'Tech & Development'
  ];

  // Fetch all employees for the dropdowns
  const { data: employees = [], isLoading: isLoadingEmployees } = useGetEmployeesQuery();
  
  // RTK Query mutation for assignment
  const [assignEmployee, { isLoading: isAssigning, isSuccess, isError, error }] = useAssignEmployeeMutation();

  // RTK Query mutation for unassignment
  const [unassignEmployee, { isLoading: isUnassigning }] = useUnassignEmployeeMutation();

  // The list of potential leads includes all employees except the one being assigned.
  const potentialLeads = useMemo(() => {
    if (!selectedEmployee) {
      return employees;
    }
    return employees.filter(emp => emp._id !== selectedEmployee); // An employee cannot be their own lead
  }, [employees, selectedEmployee]);

  const handleEmployeeSelect = (e) => {
    const newEmployeeId = e.target.value;
    setSelectedEmployee(newEmployeeId);
    // If the new employee is the same as the current lead, reset the lead to prevent self-assignment
    if (selectedLead === newEmployeeId) {
      setSelectedLead('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(''); // Clear previous errors
    if (!selectedEmployee || !selectedLead || !department) {
      setFormError('Please select an employee, department, and who they report to.');
      return;
    }
    try {
      await assignEmployee({ 
        employeeId: selectedEmployee, 
        teamLeadId: selectedLead, 
        department 
      }).unwrap();
      // Reset form on success
      setSelectedEmployee('');
      setSelectedLead('');
      setDepartment('');
      toast.success('Employee assigned successfully!');
    } catch (err) {
      console.error('Failed to assign employee:', err);
      toast.error(err.data?.message || 'Could not complete assignment.');
    }
  };

  const handleUnassign = (employee) => {
    setUnassigningEmployee(employee);
  };

  const handleConfirmUnassign = async () => {
    if (!unassigningEmployee) return;
    await unassignEmployee(unassigningEmployee._id).unwrap();
    toast.success(`Employee "${unassigningEmployee.name}" has been unassigned.`);
    setUnassigningEmployee(null); // Close modal
  };

  if (isLoadingEmployees) {
    return <div className="p-8 text-center">Loading employee data...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
        {/* Form Column */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Assign Employee</h3>
              <p className="text-sm text-slate-500 mt-1">Assign an employee to a department and a manager.</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="employee" className="block text-sm font-medium text-slate-700 mb-1">Select Employee</label>
                  <select id="employee" value={selectedEmployee} onChange={handleEmployeeSelect} className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="" disabled>-- Choose an employee --</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>{emp.name} ({emp.employeeId})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                  <select id="department" value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="" disabled>-- Choose a department --</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="lead" className="block text-sm font-medium text-slate-700 mb-1">Assign Under</label>
                  <select id="lead" value={selectedLead} onChange={(e) => setSelectedLead(e.target.value)} className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="" disabled>-- Choose an employee to report to --</option>
                    {potentialLeads.map(lead => (
                      <option key={lead._id} value={lead._id}>{lead.name}</option>
                    ))}
                  </select>
                </div>
                {formError && <div className="text-sm text-red-600 flex items-center gap-2"><ExclamationCircleIcon className="h-5 w-5"/>{formError}</div>}
                {isSuccess && <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg flex items-center gap-2"><CheckCircleIcon className="h-5 w-5"/>Employee assigned successfully!</div>}
                {isError && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg flex items-center gap-2"><ExclamationCircleIcon className="h-5 w-5"/>Error: {error.data?.message || 'An unknown error occurred.'}</div>}
              </div>
              <div className="p-6 bg-slate-50 rounded-b-lg flex justify-end">
                <button 
                  type="submit" 
                  disabled={isAssigning}
                  className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {isAssigning && <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />}
                  {isAssigning ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Table Column */}
        <div className="lg:col-span-2">
          <AssignmentTable employees={employees} isLoading={isLoadingEmployees} onUnassign={handleUnassign} />
        </div>
      </div>
      <UnassignConfirmationModal
        isOpen={!!unassigningEmployee}
        onClose={() => setUnassigningEmployee(null)}
        onConfirm={handleConfirmUnassign}
        employee={unassigningEmployee}
        isUnassigning={isUnassigning}
      />
    </div>
  );
}

export default AssignEmployee;
