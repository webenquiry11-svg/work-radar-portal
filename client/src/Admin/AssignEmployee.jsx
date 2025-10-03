import React, { useState, useMemo, useEffect } from 'react';
import { useGetEmployeesQuery, useAssignEmployeeMutation, useUnassignEmployeeMutation } from '../services/EmployeApi';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon, ArrowPathIcon, ExclamationCircleIcon, XMarkIcon, UserPlusIcon, UserMinusIcon } from '@heroicons/react/24/outline';

const AssignModal = ({ isOpen, onClose, employee, employees, onAssign, isAssigning }) => {
  const [selectedLead, setSelectedLead] = useState('');
  const [department, setDepartment] = useState('');

  useEffect(() => {
    if (employee) {
      setSelectedLead(employee.teamLead?._id || '');
      setDepartment(employee.department || '');
    }
  }, [employee]);

  if (!isOpen || !employee) return null;

  const potentialLeads = employees.filter(emp => emp._id !== employee._id);
  const departments = ['Corporate management', 'Human Resource', 'Creative Designing', 'Finance & Accounts', 'Marketing Operations', 'Sales & Marketing', 'Tech & Development'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!department || !selectedLead) {
      toast.error('Please select a department and a manager.');
      return;
    }
    onAssign({ employeeId: employee._id, teamLeadId: selectedLead, department });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Assign {employee.name}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><XMarkIcon className="h-6 w-6" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-slate-700 mb-1">Department</label>
              <select id="department" value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500">
                <option value="" disabled>-- Choose a department --</option>
                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="lead" className="block text-sm font-medium text-slate-700 mb-1">Reports To (Manager)</label>
              <select id="lead" value={selectedLead} onChange={(e) => setSelectedLead(e.target.value)} className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500">
                <option value="" disabled>-- Choose a manager --</option>
                {potentialLeads.map(lead => <option key={lead._id} value={lead._id}>{lead.name}</option>)}
              </select>
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-b-lg flex justify-end">
            <button type="submit" disabled={isAssigning} className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm disabled:bg-blue-400">
              {isAssigning && <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />}
              Save Assignment
            </button>
          </div>
        </form>
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
          <div className="mx-auto bg-yellow-100 rounded-full h-12 w-12 flex items-center justify-center my-4">
            <ExclamationCircleIcon className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Confirm Unassignment</h3>
          <p className="text-sm text-slate-500">Are you sure you want to unassign <strong className="text-slate-700">{employee?.name}</strong>? Their department and manager assignment will be removed.</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-b-lg flex justify-center gap-3">
          <button type="button" onClick={onClose} className="bg-white hover:bg-slate-100 text-slate-700 font-bold py-2 px-4 rounded-lg border border-slate-300 text-sm">Cancel</button>
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'assigned', 'unassigned'
  const [assigningEmployee, setAssigningEmployee] = useState(null);
  const [unassigningEmployee, setUnassigningEmployee] = useState(null);

  const { data: employees = [], isLoading: isLoadingEmployees } = useGetEmployeesQuery();
  const [assignEmployee, { isLoading: isAssigning }] = useAssignEmployeeMutation();
  const [unassignEmployee, { isLoading: isUnassigning }] = useUnassignEmployeeMutation();

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const isAssigned = employee.department && employee.teamLead;
      const matchesFilter =
        filter === 'all' ||
        (filter === 'assigned' && isAssigned) ||
        (filter === 'unassigned' && !isAssigned);

      const matchesSearch =
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (employee.employeeId && employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesFilter && matchesSearch;
    });
  }, [employees, searchTerm, filter]);

  const handleAssign = async (assignmentData) => {
    try {
      await assignEmployee(assignmentData).unwrap();
      toast.success('Employee assigned successfully!');
      setAssigningEmployee(null);
    } catch (err) {
      console.error('Failed to assign employee:', err);
      toast.error(err.data?.message || 'Could not complete assignment.');
    }
  };

  const handleConfirmUnassign = async () => {
    if (!unassigningEmployee) return;
    try {
      await unassignEmployee(unassigningEmployee._id).unwrap();
      toast.success(`Employee "${unassigningEmployee.name}" has been unassigned.`);
      setUnassigningEmployee(null);
    } catch (err) {
      toast.error(err.data?.message || 'Could not unassign employee.');
    }
  };

  if (isLoadingEmployees) {
    return <div className="p-8 text-center">Loading employee data...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Employee Assignment</h1>
        <p className="text-slate-500 mt-2">Manage department and manager assignments for all employees.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-lg flex-1 flex flex-col">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 border-b border-slate-200">
          <div className="relative w-full md:w-auto">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
            <input type="text" placeholder="Search employees..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2.5 w-full md:w-80 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button onClick={() => setFilter('all')} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${filter === 'all' ? 'bg-white text-blue-600 shadow' : 'text-slate-600'}`}>All</button>
            <button onClick={() => setFilter('assigned')} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${filter === 'assigned' ? 'bg-white text-blue-600 shadow' : 'text-slate-600'}`}>Assigned</button>
            <button onClick={() => setFilter('unassigned')} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${filter === 'unassigned' ? 'bg-white text-blue-600 shadow' : 'text-slate-600'}`}>Unassigned</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map(employee => (
              <div key={employee._id} className="bg-slate-50/50 rounded-xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <img src={employee.profilePicture || `https://ui-avatars.com/api/?name=${employee.name}&background=random`} alt={employee.name} className="h-14 w-14 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate">{employee.name}</p>
                    <p className="text-xs text-slate-500 font-mono">{employee.employeeId}</p>
                  </div>
                </div>
                <div className="mt-4 text-sm">
                  {employee.department && employee.teamLead ? (
                    <>
                      <p><span className="font-semibold text-slate-700">{employee.department}</span></p>
                      <p className="text-xs text-slate-500">Reports to {employee.teamLead.name}</p>
                    </>
                  ) : (
                    <span className="font-semibold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs">Unassigned</span>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                  {employee.department && employee.teamLead && (
                    <button onClick={() => setUnassigningEmployee(employee)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50">
                      <UserMinusIcon className="h-4 w-4" /> Unassign
                    </button>
                  )}
                  <button onClick={() => setAssigningEmployee(employee)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50">
                    <UserPlusIcon className="h-4 w-4" /> {employee.department ? 'Re-assign' : 'Assign'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          {filteredEmployees.length === 0 && (
            <div className="text-center p-16 text-slate-500">
              <MagnifyingGlassIcon className="h-12 w-12 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold">No Employees Found</h3>
              <p className="text-sm">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>

      <AssignModal
        isOpen={!!assigningEmployee}
        onClose={() => setAssigningEmployee(null)}
        employee={assigningEmployee}
        employees={employees}
        onAssign={handleAssign}
        isAssigning={isAssigning}
      />
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
