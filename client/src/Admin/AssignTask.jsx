import React, { useState, useMemo } from 'react';
import { useGetEmployeesQuery, useCreateMultipleTasksMutation } from '../services/EmployeApi';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowPathIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
  TrashIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

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

  if (!isOpen || !employee) return null;

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
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-white dark:bg-black h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-700 animate-slide-in-right">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-lg text-slate-800 dark:text-white">Assign Task</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="px-6 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {employee.profilePicture ? (
              <img src={employee.profilePicture} alt={employee.name} className="h-10 w-10 rounded-full border border-blue-200" />
            ) : (
              <UserCircleIcon className="h-10 w-10 text-blue-200" />
            )}
            <div>
              <div className="font-semibold text-slate-800 dark:text-white">{employee.name}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{employee.role} &middot; {employee.department || 'N/A'}</div>
              <div className="text-xs text-slate-400">{employee.employeeId}</div>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 px-6 py-4 space-y-6">
            {tasks.map((task, index) => (
              <div key={task.id} className="relative rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm p-4 space-y-3">
                {tasks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTask(index)}
                    className="absolute -top-2 -right-2 p-1.5 bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-100 border dark:border-slate-700 shadow-sm"
                  >
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
                    className="w-full text-sm border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-blue-200"
                  />
                  <textarea
                    name="description"
                    value={task.description}
                    onChange={(e) => handleChange(index, e)}
                    placeholder="Description (optional)"
                    rows="2"
                    className="w-full text-sm border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-blue-200"
                  ></textarea>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 dark:text-slate-400">Start Date</label>
                      <input
                        type="date"
                        name="startDate"
                        value={task.startDate}
                        onChange={(e) => handleChange(index, e)}
                        className="w-full text-sm border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg p-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 dark:text-slate-400">Due Date</label>
                      <input
                        type="date"
                        name="dueDate"
                        value={task.dueDate}
                        onChange={(e) => handleChange(index, e)}
                        className="w-full text-sm border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg p-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 dark:text-slate-400">Priority</label>
                      <select
                        name="priority"
                        value={task.priority}
                        onChange={(e) => handleChange(index, e)}
                        className="w-full text-sm border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg p-2 mt-1"
                      >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addTask}
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 border-2 border-dashed border-blue-300 hover:border-blue-400 dark:border-slate-600 dark:hover:border-slate-500 rounded-lg py-2 transition-colors dark:text-blue-400"
            >
              <PlusIcon className="h-4 w-4" /> Add Another Task
            </button>
          </div>
          <div className="px-6 py-4 bg-slate-50 dark:bg-black border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={isAssigning}
              className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg text-sm disabled:bg-blue-400 transition-colors shadow-sm"
            >
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
  const managers = useMemo(() => {
    return employees.filter(emp => 
      emp.dashboardAccess === 'Manager Dashboard' || emp.dashboardAccess === 'Admin Dashboard'
    );
  }, [employees]);

  const handleAssignTask = async (tasks) => {
    try {
      await createMultipleTasks({ tasks }).unwrap();
      toast.success(`${tasks.length} task(s) assigned to ${selectedEmployee.name} successfully!`);
      setSelectedEmployee(null);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to assign task.');
    }
  };

  // The component's return JSX was missing. I'm assuming a structure similar to other assignment pages.
  // If this is incorrect, we can adjust it.
  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col bg-slate-50/50 dark:bg-black/50">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Assign Task to Employee</h1>
        <p className="text-slate-500 dark:text-white mt-2">Select a manager to assign tasks to their team members.</p>
      </div>
      {/* Manager selection and task assignment UI would go here */}
    </div>
  );
};

export default AssignTask;

 