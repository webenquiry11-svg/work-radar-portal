import React, { useState, useMemo } from 'react';
import { useGetEmployeesQuery, useCreateTaskMutation } from '../services/EmployeApi';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon, XMarkIcon, ArrowPathIcon, ClipboardDocumentListIcon, PlusIcon, TrashIcon, UserCircleIcon } from '@heroicons/react/24/outline';
 
const AssignTaskModal = ({ isOpen, onClose, employee, isAssigning, onAssign }) => {
  const initialTask = {
    id: Date.now(),
    title: '',
    description: '',
    startDate: '',
    dueDate: '',
    priority: 'Medium',
  };
  const [tasks, setTasks] = useState([initialTask]);

  React.useEffect(() => {
    if (isOpen) setTasks([initialTask]);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (index, e) => {
    const newTasks = [...tasks];
    newTasks[index][e.target.name] = e.target.value;
    setTasks(newTasks);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (tasks.some(task => !task.title.trim())) {
      toast.error('Each task must have a title.');
      return;
    }
    onAssign(tasks.map(task => ({ ...task, assignedTo: employee._id })));
  };

  const addTask = () => setTasks([...tasks, { ...initialTask, id: Date.now() }]);
  const removeTask = (index) => setTasks(tasks.filter((_, i) => i !== index));

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black bg-opacity-30" onClick={onClose}></div>
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-slide-in-right">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-lg text-slate-800">Assign Task</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="px-6 pt-4 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {employee.profilePicture ? (
              <img src={employee.profilePicture} alt={employee.name} className="h-10 w-10 rounded-full border border-blue-200" />
            ) : (
              <UserCircleIcon className="h-10 w-10 text-blue-200" />
            )}
            <div>
              <div className="font-semibold text-slate-800">{employee.name}</div>
              <div className="text-xs text-slate-500">{employee.role} &middot; {employee.department || 'N/A'}</div>
              <div className="text-xs text-slate-400">{employee.employeeId}</div>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 px-6 py-4 space-y-6">
            {tasks.map((task, index) => (
              <div key={task.id} className="relative rounded-xl bg-slate-50 border border-slate-200 shadow-sm p-4 space-y-3">
                {tasks.length > 1 && (
                  <button type="button" onClick={() => removeTask(index)} className="absolute -top-2 -right-2 p-1.5 bg-white rounded-full text-slate-400 hover:text-red-600 hover:bg-red-100 border shadow-sm">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    name="title"
                    required
                    value={task.title}
                    onChange={(e) => handleChange(index, e)}
                    placeholder="Task Title"
                    className="w-full text-sm border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-200"
                  />
                  <textarea
                    name="description"
                    value={task.description}
                    onChange={(e) => handleChange(index, e)}
                    placeholder="Description (optional)"
                    rows="2"
                    className="w-full text-sm border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-200"
                  ></textarea>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-slate-500">Start Date</label>
                      <input type="date" name="startDate" value={task.startDate} onChange={(e) => handleChange(index, e)} className="w-full text-sm border-slate-300 rounded-lg p-2 mt-1" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Due Date</label>
                      <input type="date" name="dueDate" value={task.dueDate} onChange={(e) => handleChange(index, e)} className="w-full text-sm border-slate-300 rounded-lg p-2 mt-1" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Priority</label>
                      <select name="priority" value={task.priority} onChange={(e) => handleChange(index, e)} className="w-full text-sm border-slate-300 rounded-lg p-2 mt-1">
                        <option>Low</option><option>Medium</option><option>High</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={addTask} className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 border-2 border-dashed border-blue-300 hover:border-blue-400 rounded-lg py-2 transition-colors">
              <PlusIcon className="h-4 w-4" /> Add Another Task
            </button>
          </div>
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button type="submit" disabled={isAssigning} className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg text-sm disabled:bg-blue-400 transition-colors shadow-sm">
              {isAssigning && <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />}
              Assign Tasks
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AssignTask = ({ teamLeadId }) => {
  const { data: employees = [], isLoading: isLoadingEmployees } = useGetEmployeesQuery();
  const [createTask, { isLoading: isAssigning }] = useCreateTaskMutation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const teamMembers = useMemo(() => {
    const getAllSubordinates = (managerId, allEmployees) => {
      const subordinates = [];
      const queue = allEmployees.filter(emp => emp.teamLead?._id === managerId);
      const visited = new Set(queue.map(e => e._id));
      while (queue.length > 0) {
        const currentEmployee = queue.shift();
        subordinates.push(currentEmployee);
        const directReports = allEmployees.filter(emp => emp.teamLead?._id === currentEmployee._id);
        for (const report of directReports) {
          if (!visited.has(report._id)) {
            visited.add(report._id);
            queue.push(report);
          }
        }
      }
      return subordinates;
    };
    return getAllSubordinates(teamLeadId, employees);
  }, [employees, teamLeadId]);

  const filteredEmployees = useMemo(() => {
    return teamMembers.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.employeeId && employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [teamMembers, searchTerm]);

  const handleAssignTask = async (tasks) => {
    try {
      // Sequentially create each task
      for (const task of tasks) {
        await createTask(task).unwrap();
      }
      toast.success(`${tasks.length} task(s) assigned to ${selectedEmployee.name} successfully!`);
      setSelectedEmployee(null); // Close modal on success
    } catch (err) {
      toast.error(err.data?.message || 'Failed to assign task.');
    }
  };

  if (isLoadingEmployees) {
    return <div className="p-8 text-center">Loading team members...</div>;
  }

  return (
    <div className="p-4 sm:p-8 lg:p-12 h-full flex flex-col bg-gradient-to-br from-slate-50 to-white">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg mb-4">
          <ClipboardDocumentListIcon className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Task Assignment</h1>
        <p className="text-slate-500 mt-2">Delegate tasks to your team members. Click "Assign Task" to add one or more tasks.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-6 border-b border-slate-200">
          <div className="relative w-full sm:w-80">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search team members by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto rounded-b-2xl p-4">
          {filteredEmployees.length === 0 ? (
            <div className="text-center text-slate-400 py-16">No team members found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEmployees.map(employee => (
                <div key={employee._id} className="bg-gradient-to-br from-white to-blue-50 border border-slate-200 rounded-xl shadow hover:shadow-lg transition-shadow p-6 flex flex-col items-center">
                  <img
                    src={employee.profilePicture || `https://ui-avatars.com/api/?name=${employee.name}&background=random`}
                    alt={employee.name}
                    className="h-16 w-16 rounded-full object-cover border-2 border-blue-200 mb-3"
                  />
                  <div className="text-center">
                    <div className="font-bold text-slate-900 text-lg">{employee.name}</div>
                    <div className="text-xs text-slate-500 font-mono">{employee.employeeId}</div>
                    <div className="text-sm text-slate-600 mt-1">{employee.role}</div>
                    <div className="text-xs text-slate-400">{employee.department || 'N/A'}</div>
                  </div>
                  <button
                    onClick={() => setSelectedEmployee(employee)}
                    className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2 px-6 rounded-lg text-sm transition-colors shadow"
                  >
                    Assign Task
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
        <AssignTaskModal isOpen={!!selectedEmployee} onClose={() => setSelectedEmployee(null)} employee={selectedEmployee} isAssigning={isAssigning} onAssign={handleAssignTask} />
    </div>
  );
};

export default AssignTask;