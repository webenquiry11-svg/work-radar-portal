import React, { useMemo } from 'react';
import { useGetAllTasksQuery } from '../services/EmployeApi.js';
import {
  ClockIcon,
  PlayIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/solid'; 
import GooglePieChart from './GooglePieChart.jsx';

const TaskListItem = ({ task, isOverdue }) => (
  <li className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
    <div className="flex items-center gap-3">
      <img src={task.assignedTo?.profilePicture || `https://ui-avatars.com/api/?name=${task.assignedTo?.name || '?'}`} alt={task.assignedTo?.name} className="h-8 w-8 rounded-full object-cover" />
      <div>
        <p className="font-semibold text-sm text-slate-800 dark:text-white">{task.title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">To: {task.assignedTo?.name || 'N/A'}</p>
      </div>
    </div>
    {isOverdue && task.dueDate && (
      <div className="text-right">
        <p className="text-sm font-bold text-red-600">Overdue</p>
        <p className="text-xs text-red-500">{new Date(task.dueDate).toLocaleDateString()}</p>
      </div>
    )}
  </li>
);

const TaskOverview = () => {
  const { data: allTasks = [], isLoading } = useGetAllTasksQuery();

  const overviewData = useMemo(() => {
    if (!allTasks || allTasks.length === 0) {
      return {
        chartData: [],
        highPriorityTasks: [],
        overdueTasks: [],
        totalTasks: 0,
      };
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get the start of the current week (Sunday)
    const firstDayOfWeek = new Date(todayStart);
    firstDayOfWeek.setDate(firstDayOfWeek.getDate() - todayStart.getDay());

    const endOfWeek = new Date(firstDayOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const statusCounts = {
      Pending: 0,
      'In Progress': 0,
      'Pending Verification': 0,
      Completed: 0,
      'Not Completed': 0,
    };

    allTasks.forEach(task => {
      if (statusCounts.hasOwnProperty(task.status)) {
        statusCounts[task.status]++;
      }
    });

    const chartData = [
      { name: 'Pending', value: statusCounts.Pending },
      { name: 'In Progress', value: statusCounts['In Progress'] },
      { name: 'Verification', value: statusCounts['Pending Verification'] },
      { name: 'Completed', value: statusCounts.Completed },
      { name: 'Not Completed', value: statusCounts['Not Completed'] },
    ];

    return {
      chartData,
      highPriorityTasks: allTasks.filter(
        (t) =>
          !['Completed', 'Not Completed'].includes(t.status) &&
          t.priority === 'High'
      ),
      overdueTasks: allTasks.filter(
        t => ['Pending', 'In Progress'].includes(t.status) && t.dueDate && new Date(t.dueDate) < todayStart
      ),
      totalTasks: allTasks.length,
    };
  }, [allTasks]);

  const TASK_COLORS = {
    'Pending': '#F59E0B', // Amber
    'In Progress': '#3B82F6', // Blue
    'Verification': '#8B5CF6', // Purple
    'Completed': '#10B981', // Emerald
    'Not Completed': '#F97316', // Orange
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading task overview...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col bg-slate-50/50 dark:bg-black/50">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Tasks Overview</h1>
        <p className="text-slate-500 dark:text-white mt-2">Monitor the status of all tasks across the organization.</p>
      </div>

      <div className="bg-white dark:bg-black rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg p-4 sm:p-8 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="relative h-[400px]">
            <div className="w-full h-full">
              <GooglePieChart data={overviewData.chartData} title="" colors={TASK_COLORS} is3D={true} />
            </div>
            {overviewData.totalTasks > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-5xl font-bold text-slate-800 dark:text-white">{overviewData.totalTasks}</p>
                <p className="text-sm font-semibold text-slate-500 dark:text-white">Total Tasks</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-yellow-50 dark:bg-slate-900 border-l-4 border-yellow-400 p-5 rounded-lg">
              <ClockIcon className="h-7 w-7 text-yellow-500 mb-2" />
              <p className="text-3xl font-bold text-slate-800 dark:text-white">{overviewData.chartData.find(d => d.name === 'Pending')?.value || 0}</p>
              <p className="text-sm font-semibold text-slate-600 dark:text-white">Pending</p>
            </div>
            <div className="bg-blue-50 dark:bg-slate-900 border-l-4 border-blue-400 p-5 rounded-lg">
              <PlayIcon className="h-7 w-7 text-blue-500 mb-2" />
              <p className="text-3xl font-bold text-slate-800 dark:text-white">{overviewData.chartData.find(d => d.name === 'In Progress')?.value || 0}</p>
              <p className="text-sm font-semibold text-slate-600 dark:text-white">In Progress</p>
            </div>
            <div className="bg-purple-50 dark:bg-slate-900 border-l-4 border-purple-400 p-5 rounded-lg">
              <ExclamationTriangleIcon className="h-7 w-7 text-purple-500 mb-2" />
              <p className="text-3xl font-bold text-slate-800 dark:text-white">{overviewData.chartData.find(d => d.name === 'Verification')?.value || 0}</p>
              <p className="text-sm font-semibold text-slate-600 dark:text-white">Verification</p>
            </div>
            <div className="bg-emerald-50 dark:bg-slate-900 border-l-4 border-emerald-400 p-5 rounded-lg">
              <CheckCircleIcon className="h-7 w-7 text-emerald-500 mb-2" />
              <p className="text-3xl font-bold text-slate-800 dark:text-white">{overviewData.chartData.find(d => d.name === 'Completed')?.value || 0}</p>
              <p className="text-sm font-semibold text-slate-600 dark:text-white">Completed</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-black rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">High-Priority Active Tasks</h3>
          <div className="flex-1 overflow-y-auto -mr-2 pr-2">
            {overviewData.highPriorityTasks.length > 0 ? (
              <ul className="space-y-2">
                {overviewData.highPriorityTasks.map(task => <TaskListItem key={task._id} task={task} />)}
              </ul>
            ) : (
              <p className="text-center text-sm text-slate-400 dark:text-white pt-10">No high-priority tasks are active.</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-black rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Overdue Tasks</h3>
          <div className="flex-1 overflow-y-auto -mr-2 pr-2">
            {overviewData.overdueTasks.length > 0 ? (
              <ul className="space-y-2">
                {overviewData.overdueTasks.map(task => <TaskListItem key={task._id} task={task} isOverdue={true} />)}
              </ul>
            ) : (
              <p className="text-center text-sm text-slate-400 dark:text-white pt-10">No tasks are currently overdue.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskOverview;