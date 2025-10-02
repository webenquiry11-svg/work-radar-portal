import React, { useState, useMemo } from 'react';
import { useGetEmployeesQuery, useCreateTaskMutation } from '../services/EmployeApi';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon, XMarkIcon, ArrowPathIcon, ClipboardDocumentListIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

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

  if (!isOpen) return null;

  const handleChange = (index, e) => {
    const newTasks = [...tasks];
    newTasks[index][e.target.name] = e.target.value;
    setTasks(newTasks);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAssign(tasks.map(task => ({ ...task, assignedTo: employee._id })));
  };

  const addTask = () => setTasks([...tasks, { ...initialTask, id: Date.now() }]);
  const removeTask = (index) => setTasks(tasks.filter((_, i) => i !== index));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Assign Task to {employee.name}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="divide-y divide-slate-200">
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {tasks.map((task, index) => (
              <div key={task.id} className="p-4 border rounded-xl bg-slate-50/50 relative space-y-3">
                {tasks.length > 1 && (
                  <button type="button" onClick={() => removeTask(index)} className="absolute -top-2 -right-2 p-1.5 bg-white rounded-full text-slate-400 hover:text-red-600 hover:bg-red-100 border shadow-sm">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
                <input type="text" name="title" required value={task.title} onChange={(e) => handleChange(index, e)} placeholder="Task Title" className="w-full text-sm border-slate-300 rounded-lg p-2" />
                <textarea name="description" value={task.description} onChange={(e) => handleChange(index, e)} placeholder="Description (optional)" rows="2" className="w-full text-sm border-slate-300 rounded-lg p-2"></textarea>
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
            ))}
            <button type="button" onClick={addTask} className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 border-2 border-dashed border-blue-300 hover:border-blue-400 rounded-lg py-2 transition-colors">
              <PlusIcon className="h-4 w-4" /> Add Another Task
            </button>
          </div>
          <div className="p-4 bg-slate-50 flex justify-end">
            <button type="submit" disabled={isAssigning} className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm disabled:bg-blue-400 transition-colors shadow-sm">
              {isAssigning && <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />}
              Assign Tasks
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AssignTask = () => {
  const { data: employees = [], isLoading: isLoadingEmployees } = useGetEmployeesQuery();
  const [createTask, { isLoading: isAssigning }] = useCreateTaskMutation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const managers = useMemo(() => {
    return employees.filter(emp => emp.dashboardAccess === 'Manager Dashboard');
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return managers.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.employeeId && employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [managers, searchTerm]);

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
    return <div className="p-8 text-center">Loading managers...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
        <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg mb-4">
                <ClipboardDocumentListIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Task Assignment</h1>
            <p className="text-slate-500 mt-2">Delegate tasks to managers.</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-lg flex-1 flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-6 border-b border-slate-200">
                <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search managers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2.5 w-full sm:w-80 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto rounded-b-xl">
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Role</th>
                            <th scope="col" className="px-6 py-3">Department</th>
                            <th scope="col" className="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.map(employee => (
                            <tr key={employee._id} className="bg-white border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-semibold text-slate-900">
                                    <div className="flex items-center gap-3">
                                        <img src={employee.profilePicture || `https://ui-avatars.com/api/?name=${employee.name}&background=random`} alt={employee.name} className="h-9 w-9 rounded-full object-cover" />
                                        <div>
                                            <div>{employee.name}</div>
                                            <div className="text-xs text-slate-500 font-mono">{employee.employeeId}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">{employee.role}</td>
                                <td className="px-6 py-4">{employee.department || 'N/A'}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => setSelectedEmployee(employee)} className="bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold py-1.5 px-3 rounded-lg text-xs transition-colors">
                                        Assign Task
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        <AssignTaskModal isOpen={!!selectedEmployee} onClose={() => setSelectedEmployee(null)} employee={selectedEmployee} isAssigning={isAssigning} onAssign={handleAssignTask} />
    </div>
  );
};

export default AssignTask;