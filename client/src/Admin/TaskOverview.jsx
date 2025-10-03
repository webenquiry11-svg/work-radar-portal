import React, { useMemo } from 'react';
import { useGetAllTasksQuery } from '../services/EmployeApi.js';
import {
  ClockIcon,
  PlayIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/solid';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const statusCounts = {
      Pending: 0,
      'In Progress': 0,
      'Pending Verification': 0,
      Completed: 0,
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
    ];

    const activeTasks = allTasks.filter(t => t.status !== 'Completed');

    return {
      chartData,
      highPriorityTasks: activeTasks.filter(t => t.priority === 'High'),
      overdueTasks: activeTasks.filter(t => t.dueDate && new Date(t.dueDate) < today),
      totalTasks: allTasks.length,
    };
  }, [allTasks]);

  const TASK_COLORS = {
    'Pending': '#F59E0B', // Amber
    'In Progress': '#3B82F6', // Blue
    'Verification': '#8B5CF6', // Purple
    'Completed': '#10B981', // Emerald
  };

  const TaskListItem = ({ task, isOverdue }) => (
    <li className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-100 transition-colors">
      <div className="flex items-center gap-3">
        <img src={task.assignedTo?.profilePicture || `https://ui-avatars.com/api/?name=${task.assignedTo?.name || '?'}`} alt={task.assignedTo?.name} className="h-8 w-8 rounded-full object-cover" />
        <div>
          <p className="font-semibold text-sm text-slate-800">{task.title}</p>
          <p className="text-xs text-slate-500">To: {task.assignedTo?.name || 'N/A'}</p>
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

  if (isLoading) {
    return <div className="p-8 text-center">Loading task overview...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col bg-slate-50/50">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Tasks Overview</h1>
        <p className="text-slate-500 mt-2">Monitor the status of all tasks across the organization.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="relative h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={overviewData.chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {overviewData.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={TASK_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-5xl font-bold text-slate-800">{overviewData.totalTasks}</p>
              <p className="text-sm font-semibold text-slate-500">Total Tasks</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 rounded-lg">
              <ClockIcon className="h-7 w-7 text-yellow-500 mb-2" />
              <p className="text-3xl font-bold text-slate-800">{overviewData.chartData.find(d => d.name === 'Pending')?.value || 0}</p>
              <p className="text-sm font-semibold text-slate-600">Pending</p>
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-5 rounded-lg">
              <PlayIcon className="h-7 w-7 text-blue-500 mb-2" />
              <p className="text-3xl font-bold text-slate-800">{overviewData.chartData.find(d => d.name === 'In Progress')?.value || 0}</p>
              <p className="text-sm font-semibold text-slate-600">In Progress</p>
            </div>
            <div className="bg-purple-50 border-l-4 border-purple-400 p-5 rounded-lg">
              <ExclamationTriangleIcon className="h-7 w-7 text-purple-500 mb-2" />
              <p className="text-3xl font-bold text-slate-800">{overviewData.chartData.find(d => d.name === 'Verification')?.value || 0}</p>
              <p className="text-sm font-semibold text-slate-600">Verification</p>
            </div>
            <div className="bg-emerald-50 border-l-4 border-emerald-400 p-5 rounded-lg">
              <CheckCircleIcon className="h-7 w-7 text-emerald-500 mb-2" />
              <p className="text-3xl font-bold text-slate-800">{overviewData.chartData.find(d => d.name === 'Completed')?.value || 0}</p>
              <p className="text-sm font-semibold text-slate-600">Completed</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">High-Priority Active Tasks</h3>
          <div className="flex-1 overflow-y-auto -mr-2 pr-2">
            {overviewData.highPriorityTasks.length > 0 ? (
              <ul className="space-y-2">
                {overviewData.highPriorityTasks.map(task => <TaskListItem key={task._id} task={task} />)}
              </ul>
            ) : (
              <p className="text-center text-sm text-slate-400 pt-10">No high-priority tasks are active.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Overdue Tasks</h3>
          <div className="flex-1 overflow-y-auto -mr-2 pr-2">
            {overviewData.overdueTasks.length > 0 ? (
              <ul className="space-y-2">
                {overviewData.overdueTasks.map(task => <TaskListItem key={task._id} task={task} isOverdue={true} />)}
              </ul>
            ) : (
              <p className="text-center text-sm text-slate-400 pt-10">No tasks are currently overdue.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskOverview;