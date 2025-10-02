import React, { useMemo, useState } from 'react';
import { useGetAllTasksQuery } from '../services/EmployeApi';
import { CheckCircleIcon, ClockIcon, FunnelIcon } from '@heroicons/react/24/outline';

const TaskList = ({ title, tasks, icon: Icon, iconColor }) => {
  const priorityStyles = {
    High: 'bg-red-100 text-red-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    Low: 'bg-green-100 text-green-800',
  };

  const completionCategoryStyles = {
    Pending: 'bg-red-100 text-red-800',
    Low: 'bg-yellow-100 text-yellow-800',
    Moderate: 'bg-blue-100 text-blue-800',
    Completed: 'bg-emerald-100 text-emerald-800',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-lg flex-1 flex flex-col">
      <div className={`p-5 border-b border-slate-200 flex items-center gap-3 ${iconColor}`}>
        <Icon className="h-6 w-6" />
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <div className="overflow-y-auto">
        {tasks.length > 0 ? (
          <ul className="divide-y divide-slate-200">
            {tasks.map(task => (
              <li key={task._id} className="p-4 hover:bg-slate-50/50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-slate-800">{task.title}</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-md truncate" title={task.description}>{task.description}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${priorityStyles[task.priority]}`}>
                    {task.priority}
                  </span>
                </div>
                {title === 'Completed Tasks' && task.completionCategory !== 'N/A' && (
                  <div className="mt-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${completionCategoryStyles[task.completionCategory]}`}>
                      Final Grade: {task.completionCategory}
                    </span>
                  </div>
                )}
                <div className="mt-3 flex justify-between items-center text-xs text-slate-500">
                  <div>
                    Assigned to: <span className="font-medium text-slate-700">{task.assignedTo?.name || 'N/A'}</span>
                  </div>
                  <div>
                    By: <span className="font-medium text-slate-700">{task.assignedBy?.name || 'N/A'}</span>
                  </div>
                  {task.dueDate && (
                    <div>
                      Due: <span className="font-medium text-slate-700">{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-10 text-center text-slate-500">
            No tasks in this category.
          </div>
        )}
      </div>
    </div>
  );
};

const TaskOverview = () => {
  const { data: allTasks = [], isLoading } = useGetAllTasksQuery();
  const [completionFilter, setCompletionFilter] = useState('');

  const { completedTasks, pendingTasks } = useMemo(() => {
    const allCompleted = allTasks.filter(task => task.status === 'Completed');
    const allPending = allTasks.filter(task => task.status !== 'Completed');

    const filteredCompleted = completionFilter
      ? allCompleted.filter(task => task.completionCategory === completionFilter)
      : allCompleted;

    return { completedTasks: filteredCompleted, pendingTasks: allPending };
  }, [allTasks, completionFilter]);

  if (isLoading) {
    return <div className="p-8 text-center">Loading task overview...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Tasks Overview</h1>
        <p className="text-slate-500 mt-2">Monitor the status of all tasks across the organization.</p>
      </div>
      <div className="mb-6 flex justify-end">
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-5 w-5 text-slate-400" />
          <label htmlFor="completionFilter" className="text-sm font-medium text-slate-700">Filter Completed by Grade:</label>
          <select
            id="completionFilter"
            onChange={(e) => setCompletionFilter(e.target.value)}
            value={completionFilter}
            className="text-sm border border-slate-300 rounded-lg p-2 focus:ring-blue-500"
          >
            <option value="">All Grades</option>
            <option value="Completed">Completed</option>
            <option value="Moderate">Moderate</option>
            <option value="Low">Low</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TaskList
          title="Pending & In-Progress Tasks"
          tasks={pendingTasks}
          icon={ClockIcon}
          iconColor="text-blue-500"
        />
        <TaskList
          title="Completed Tasks"
          tasks={completedTasks}
          icon={CheckCircleIcon}
          iconColor="text-emerald-500"
        />
      </div>
    </div>
  );
};

export default TaskOverview;