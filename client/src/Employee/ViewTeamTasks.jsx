import React, { useState, useMemo, useEffect } from 'react';
import { useGetAllTasksQuery, useGetEmployeesQuery, useUpdateTaskMutation, useDeleteTaskMutation } from '../services/EmployeApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../app/authSlice';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon, PencilIcon, ArrowPathIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

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
      });
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleChange = (e) => {
    setTaskData({ ...taskData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { status, ...updateData } = taskData;
    try {
      await updateTask({ id: task._id, ...updateData }).unwrap();
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

const ViewTeamTasks = ({ teamLeadId }) => {
  const { data: allTasks = [], isLoading: isLoadingTasks, refetch } = useGetAllTasksQuery();
  const { data: allEmployees = [], isLoading: isLoadingEmployees } = useGetEmployeesQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();
  const currentUser = useSelector(selectCurrentUser);

  const teamMemberIds = useMemo(() => {
    if (!allEmployees || !teamLeadId) return new Set();

    const subordinates = [];
    const queue = allEmployees.filter(emp => emp.teamLead?._id === teamLeadId);
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
    return new Set(subordinates.map(emp => emp._id));
  }, [allEmployees, teamLeadId]);

  const teamTasks = useMemo(() => {
    return allTasks.filter(task => teamMemberIds.has(task.assignedTo?._id));
  }, [allTasks, teamMemberIds]);

  const filteredTasks = useMemo(() => {
    return teamTasks.filter(task => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.assignedTo?.name && task.assignedTo.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = filters.status ? task.status === filters.status : true;
      const matchesPriority = filters.priority ? task.priority === filters.priority : true;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [teamTasks, searchTerm, filters]);

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
  const statusStyles = { Pending: 'bg-slate-100 text-slate-800', 'In Progress': 'bg-blue-100 text-blue-800', Completed: 'bg-emerald-100 text-emerald-800', 'Pending Verification': 'bg-purple-100 text-purple-800' };
  const completionCategoryStyles = {
    Pending: 'bg-red-100 text-red-800',
    Low: 'bg-yellow-100 text-yellow-800',
    Moderate: 'bg-blue-100 text-blue-800',
    Completed: 'bg-emerald-100 text-emerald-800',
  };

  if (isLoadingTasks || isLoadingEmployees) {
    return <div className="p-8 text-center">Loading team tasks...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Team Tasks</h1>
        <p className="text-slate-500 mt-2">An overview of all tasks assigned to your team members.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-lg flex-1 flex flex-col">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 border-b border-slate-200">
          <div className="relative w-full md:w-auto">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
            <input type="text" placeholder="Search tasks or people..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2.5 w-full md:w-80 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <FunnelIcon className="h-5 w-5 text-slate-400" />
            <select onChange={(e) => handleFilterChange('status', e.target.value)} value={filters.status} className="text-sm border border-slate-300 rounded-lg p-2 focus:ring-blue-500">
              <option value="">All Statuses</option>
              <option>Pending</option><option>In Progress</option><option>Pending Verification</option><option>Completed</option>
            </select>
            <select onChange={(e) => handleFilterChange('priority', e.target.value)} value={filters.priority} className="text-sm border border-slate-300 rounded-lg p-2 focus:ring-blue-500">
              <option value="">All Priorities</option>
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto rounded-b-xl">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-6 py-3">Task Title</th>
                <th scope="col" className="px-6 py-3">Assigned To</th>
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
                    <td className="px-6 py-4">{task.assignedTo?.name || 'N/A'}</td>
                    <td className="px-6 py-4">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4">{task.completionDate ? new Date(task.completionDate).toLocaleDateString() : <span className="text-slate-400 text-xs">--</span>}</td>
                    <td className="px-6 py-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[task.status]}`}>{task.status}</span></td>
                    <td className="px-6 py-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${priorityStyles[task.priority]}`}>{task.priority}</span></td>
                    <td className="px-6 py-4">
                      {task.status === 'Completed' && task.completionCategory !== 'N/A' ? (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${completionCategoryStyles[task.completionCategory]}`}>
                          {task.completionCategory}
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