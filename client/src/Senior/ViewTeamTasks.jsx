import React, { useState, useMemo, useEffect } from 'react';
import { useGetAllTasksQuery, useGetEmployeesQuery, useUpdateTaskMutation, useDeleteTaskMutation } from '../services/EmployeApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../app/authSlice';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon, PencilIcon, ArrowPathIcon, TrashIcon, ExclamationTriangleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const EditTaskModal = ({ isOpen, onClose, task, onUpdate }) => {
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [taskData, setTaskData] = useState({});

  useEffect(() => {
    if (task) {
      setTaskData({
        title: task.title || '',
        description: task.description || '',
        startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        priority: task.priority || 'Medium',
        status: task.status || 'Pending',
      });
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleChange = (e) => {
    setTaskData({ ...taskData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateTask({ id: task._id, ...taskData }).unwrap();
      toast.success('Task updated successfully!');
      onUpdate();
      onClose();
    } catch (err) {
      toast.error(err.data?.message || 'Failed to update task.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Edit Task</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><XMarkIcon className="h-6 w-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="divide-y divide-slate-200">
          <div className="p-6 space-y-4">
            <input type="text" name="title" value={taskData.title} onChange={handleChange} className="w-full text-sm border border-slate-300 rounded-lg p-2.5" placeholder="Task Title" />
            <textarea name="description" value={taskData.description} onChange={handleChange} rows="3" className="w-full text-sm border border-slate-300 rounded-lg p-2.5" placeholder="Description"></textarea>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="date" name="startDate" value={taskData.startDate} onChange={handleChange} className="w-full text-sm border border-slate-300 rounded-lg p-2.5" />
              <input type="date" name="dueDate" value={taskData.dueDate} onChange={handleChange} className="w-full text-sm border border-slate-300 rounded-lg p-2.5" />
              <select name="priority" value={taskData.priority} onChange={handleChange} className="w-full text-sm border border-slate-300 rounded-lg p-2.5">
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
            </div>
          </div>
          <div className="p-4 bg-slate-50 flex justify-end">
            <button type="submit" disabled={isUpdating} className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm disabled:bg-blue-400">
              {isUpdating && <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, task, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
        <div className="p-6 text-center">
          <div className="mx-auto bg-red-100 rounded-full h-12 w-12 flex items-center justify-center my-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Confirm Deletion</h3>
          <p className="text-sm text-slate-500 mt-2">Are you sure you want to delete the task "{task?.title}"? This action cannot be undone.</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-b-lg flex justify-center gap-3">
          <button type="button" onClick={onClose} className="bg-white hover:bg-slate-100 text-slate-700 font-bold py-2 px-4 rounded-lg border border-slate-300 text-sm">Cancel</button>
          <button type="button" onClick={onConfirm} disabled={isDeleting} className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm disabled:bg-red-400">
            {isDeleting && <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />}
            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ViewTeamTasks = ({ teamLeadId, initialFilters = {} }) => {
  const { data: allTasks = [], isLoading: isLoadingTasks, refetch } = useGetAllTasksQuery(undefined, { pollingInterval: 30000 });
  const { data: allEmployees = [], isLoading: isLoadingEmployees } = useGetEmployeesQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ status: initialFilters.status || '', priority: initialFilters.priority || '' });
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();
  const currentUser = useSelector(selectCurrentUser);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  const { status: initialStatus, priority: initialPriority } = initialFilters;

  useEffect(() => {
    setFilters({ status: initialStatus || '', priority: initialPriority || '' });
  }, [initialStatus, initialPriority]);

  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
    // Set default date range to the current week
    const today = new Date();
    const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);

    setDateRange({
      startDate: firstDayOfWeek.toISOString().split('T')[0],
      endDate: lastDayOfWeek.toISOString().split('T')[0],
    });
  };

  const teamMemberIds = useMemo(() => {
    if (!allEmployees || !teamLeadId) return new Set();

    const subordinates = [];
    const getTeamLeadId = (emp) => emp.teamLead?._id || emp.teamLead;
    const queue = allEmployees.filter(emp => getTeamLeadId(emp) === teamLeadId);
    const visited = new Set(queue.map(e => e._id));

    while (queue.length > 0) {
      const currentEmployee = queue.shift();
      subordinates.push(currentEmployee);
      const directReports = allEmployees.filter(emp => getTeamLeadId(emp) === currentEmployee._id);
      for (const report of directReports) {
        if (!visited.has(report._id)) {
          visited.add(report._id);
          queue.push(report);
        }
      }
    }
    return new Set(subordinates.map(emp => emp._id));
  }, [allEmployees, teamLeadId]);

  const filteredEmployees = useMemo(() => {
    if (!teamMemberIds) return [];
    const members = allEmployees.filter(e => teamMemberIds.has(e._id));
    if (!searchTerm) return members;
    return members.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allEmployees, teamMemberIds, searchTerm]);

  const filteredTasks = useMemo(() => {
    if (!selectedEmployee) return [];

    let employeeTasks = allTasks.filter(task => task.assignedTo?._id === selectedEmployee._id);

    // Filter by date range (assignment date)
    if (dateRange.startDate && dateRange.endDate) {
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      end.setHours(23, 59, 59, 999); // Include the whole end day

      employeeTasks = employeeTasks.filter(task => {
        const assignedDate = new Date(task.createdAt);
        return assignedDate >= start && assignedDate <= end;
      });
    }

    return employeeTasks.filter(task => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filters.status ? task.status === filters.status : true;
      const matchesPriority = filters.priority ? task.priority === filters.priority : true;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [allTasks, searchTerm, filters, selectedEmployee, dateRange]);

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  const handleConfirmDelete = async () => {
    if (!deletingTask) return;
    try {
      await deleteTask(deletingTask._id).unwrap();
      toast.success('Task deleted successfully!');
      setDeletingTask(null);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to delete task.');
    }
  };

  const priorityStyles = { High: 'bg-red-100 text-red-800', Medium: 'bg-yellow-100 text-yellow-800', Low: 'bg-green-100 text-green-800' };
  const statusStyles = { Pending: 'bg-slate-100 text-slate-800', 'In Progress': 'bg-blue-100 text-blue-800', Completed: 'bg-emerald-100 text-emerald-800', 'Pending Verification': 'bg-purple-100 text-purple-800', 'Not Completed': 'bg-orange-100 text-orange-800' };
  const completionCategoryStyles = {
    Pending: 'bg-red-100 text-red-800',
    Low: 'bg-yellow-100 text-yellow-800',
    Moderate: 'bg-blue-100 text-blue-800',
    Completed: 'bg-emerald-100 text-emerald-800',
  };

  if (isLoadingTasks || isLoadingEmployees) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!selectedEmployee) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">View Team Tasks</h1>
          <p className="text-slate-500 mt-2">Select a team member to view their assigned tasks.</p>
        </div>
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md text-sm border border-slate-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEmployees.map(employee => (
            <div
              key={employee._id}
              onClick={() => handleSelectEmployee(employee)}
              className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center text-center border-t-4 border-blue-500 hover:scale-105 transition-transform duration-200 cursor-pointer"
            >
              <img 
                src={employee.profilePicture || `https://ui-avatars.com/api/?name=${employee.name}&background=random`} 
                alt={employee.name} 
                onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${employee.name}&background=random`; }}
                className="h-20 w-20 rounded-full object-cover mb-4 border-4 border-slate-100" 
              />
              <p className="font-bold text-slate-800">{employee.name}</p>
              <p className="text-sm text-blue-600 font-medium">{employee.role}</p>
              <p className="text-xs text-slate-500 mt-1 font-mono">{employee.employeeId}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => { setSelectedEmployee(null); setSearchTerm(''); }} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
            <ArrowLeftIcon className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Tasks for {selectedEmployee.name}</h1>
            <p className="text-slate-500 mt-1">An overview of all tasks assigned to this team member.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-lg flex-1 flex flex-col">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 border-b border-slate-200">
          <div className="relative w-full md:w-auto">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
            <input type="text" placeholder="Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2.5 w-full md:w-80 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={dateRange.startDate}
                onChange={e => setDateRange(prev => ({...prev, startDate: e.target.value}))}
                className="text-sm border border-slate-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
              <input 
                type="date" 
                value={dateRange.endDate}
                onChange={e => setDateRange(prev => ({...prev, endDate: e.target.value}))}
                className="text-sm border border-slate-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>
            <FunnelIcon className="h-5 w-5 text-slate-400" />
            <select onChange={(e) => handleFilterChange('status', e.target.value)} value={filters.status} className="text-sm border border-slate-300 rounded-lg p-2 focus:ring-blue-500">
              <option value="">All Statuses</option><option>Pending</option><option>In Progress</option><option>Pending Verification</option><option>Completed</option><option>Not Completed</option>
            </select>
            <select onChange={(e) => handleFilterChange('priority', e.target.value)} value={filters.priority} className="text-sm border border-slate-300 rounded-lg p-2 focus:ring-blue-500">
              <option value="">All Priorities</option>
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-auto rounded-b-xl">
          <table className="w-full text-sm text-left text-slate-600 min-w-[900px]">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-6 py-3">Task Title</th>
                <th scope="col" className="px-6 py-3">Assigned By</th>
                <th scope="col" className="px-6 py-3">Due Date</th>
                <th scope="col" className="px-6 py-3">Completed On</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Priority</th>
                <th scope="col" className="px-6 py-3">Final Grade</th>
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
                  <tr key={task._id} className="bg-white hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{task.title}</div>
                      <div className="text-xs text-slate-500 truncate max-w-xs">{task.description}</div>
                    </td>
                    <td className="px-6 py-4">{task.assignedBy?.name || 'N/A'}</td>
                    <td className="px-6 py-4">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4">
                      {task.status === 'Not Completed' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                          Incomplete
                        </span>
                      ) : task.status === 'Completed' && task.completionDate ? (
                        new Date(task.completionDate).toLocaleDateString()
                      ) : <span className="text-slate-400 dark:text-slate-500 text-xs">--</span>}
                    </td>
                    <td className="px-6 py-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[task.status]}`}>{task.status}</span></td>
                    <td className="px-6 py-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${priorityStyles[task.priority]}`}>{task.priority}</span></td>
                    <td className="px-6 py-4">
                      {['Completed', 'Not Completed'].includes(task.status) ? (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${completionCategoryStyles[task.completionCategory]}`}>
                          {task.completionCategory || 'Graded'}
                        </span>
                      ) : <span className="text-slate-400 text-xs">--</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {currentUser?.role === 'Admin' || currentUser?.canUpdateTask || currentUser?.canDeleteTask ? (
                        <div className="flex items-center justify-end gap-1">
                          {(currentUser.role === 'Admin' || currentUser.canUpdateTask) && (
                            <button onClick={() => setEditingTask(task)} className="p-1.5 text-slate-500 hover:text-blue-600 rounded-md hover:bg-blue-100" title="Edit Task">
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          )}
                          {(currentUser.role === 'Admin' || currentUser.canDeleteTask) && (
                            <button onClick={() => setDeletingTask(task)} className="p-1.5 text-slate-500 hover:text-red-600 rounded-md hover:bg-red-100" title="Delete Task">
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">No Actions</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center p-10 text-slate-500">
                    <div className="flex flex-col items-center">
                      <MagnifyingGlassIcon className="h-10 w-10 text-slate-400 mb-2" />
                      <span className="font-semibold">No tasks found for your team.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <EditTaskModal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        task={editingTask}
        onUpdate={refetch}
      />
      <DeleteConfirmationModal
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleConfirmDelete}
        task={deletingTask}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ViewTeamTasks;