import React, { useMemo } from 'react';
import {
  UsersIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  ClockIcon,
  TrophyIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useGetDashboardStatsQuery, useGetAllTasksQuery, useGetEmployeeOfTheMonthCandidatesQuery } from '../services/EmployeApi';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
const Dashboard = ({ onNavigate }) => {
  const { data: stats, isLoading: isLoadingStats } = useGetDashboardStatsQuery();
  const { data: allTasks = [], isLoading: isLoadingTasks } = useGetAllTasksQuery();
  const { data: eomCandidates = [], isLoading: isLoadingEOM } = useGetEmployeeOfTheMonthCandidatesQuery({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const isLoading = isLoadingStats || isLoadingTasks || isLoadingEOM;

  const dashboardData = useMemo(() => {
    if (isLoading) return null;

    const tasksPendingVerification = allTasks.filter(t => t.status === 'Pending Verification').length;
    const activeTasks = allTasks.filter(t => t.status !== 'Completed').length;
    const topCandidate = eomCandidates[0];

    const taskChartData = [
      { name: 'Pending', value: allTasks.filter(t => t.status === 'Pending').length },
      { name: 'In Progress', value: allTasks.filter(t => t.status === 'In Progress').length },
      { name: 'Verification', value: tasksPendingVerification },
      { name: 'Completed', value: allTasks.filter(t => t.status === 'Completed').length },
    ].filter(entry => entry.value > 0);

    const totalTasks = allTasks.length;

    return {
      totalEmployees: stats?.totalEmployees ?? 0,
      activeDepartments: stats?.employeesPerDepartment?.length ?? 0,
      tasksPendingVerification,
      activeTasks,
      topCandidate,
      taskChartData,
      totalTasks,
    };
  }, [isLoading, stats, allTasks, eomCandidates]);

  if (isLoading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  const TASK_COLORS = {
    'Completed': '#10B981',
    'In Progress': '#3B82F6',
    'Pending': '#F59E0B',
    'Verification': '#8B5CF6',
  };

  // --- Redesigned Attractive Admin Dashboard ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 font-manrope relative overflow-hidden">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 text-white rounded-b-3xl shadow-xl mb-12 overflow-hidden p-8">
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg">Welcome, Admin!</h1>
          <p className="mt-3 text-lg text-blue-100/90 font-medium">Here’s a vibrant snapshot of your organization’s performance.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 -mt-20 z-20 relative">
        <div
          onClick={() => onNavigate && onNavigate('employees')}
          className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center border-t-4 border-blue-500 hover:scale-105 transition-transform duration-200 cursor-pointer"
        >
          <UsersIcon className="h-10 w-10 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-blue-700">{dashboardData.totalEmployees}</p>
          <p className="text-sm font-semibold text-gray-500">Total Employees</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center border-t-4 border-green-500 hover:scale-105 transition-transform duration-200">
          <BuildingOfficeIcon className="h-10 w-10 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-green-700">{dashboardData.activeDepartments}</p>
          <p className="text-sm font-semibold text-gray-500">Active Departments</p>
        </div>
        <div
          onClick={() => onNavigate && onNavigate('view-tasks')}
          className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center border-t-4 border-indigo-500 hover:scale-105 transition-transform duration-200 cursor-pointer"
        >
          <BriefcaseIcon className="h-10 w-10 text-indigo-500 mb-2" />
          <p className="text-2xl font-bold text-indigo-700">{dashboardData.totalTasks}</p>
          <p className="text-sm font-semibold text-gray-500">Total Tasks</p>
        </div>
        <div
          onClick={() => onNavigate && onNavigate({ component: 'view-tasks', props: { initialFilters: { status: 'Pending Verification' } } })}
          className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center border-t-4 border-amber-500 hover:scale-105 transition-transform duration-200 cursor-pointer"
        >
          <ClockIcon className="h-10 w-10 text-amber-500 mb-2" />
          <p className="text-2xl font-bold text-amber-700">{dashboardData.tasksPendingVerification}</p>
          <p className="text-sm font-semibold text-gray-500">Pending Verification</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 px-4 mt-16 mb-16">
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-lg rounded-2xl border border-blue-100 shadow-2xl p-8 flex flex-col items-center justify-center hover:shadow-3xl transition-shadow duration-300 relative overflow-hidden">
          <div className="absolute -top-10 -left-10 h-32 w-32 bg-blue-200 opacity-20 rounded-full blur-2xl"></div>
          <h3 className="text-xl font-bold text-blue-700 mb-4 tracking-tight z-10">Overall Task Status</h3>
          {dashboardData.totalTasks > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={dashboardData.taskChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dashboardData.taskChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={TASK_COLORS[entry.name]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">No task data available.</div>
          )}
        </div>

        {dashboardData.topCandidate ? (
          <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center text-center border border-slate-200">
            <TrophyIcon className="h-12 w-12 text-amber-400" />
            <h3 className="text-lg font-bold text-slate-800 mt-2">Top Performer This Month</h3>
            <img
              src={dashboardData.topCandidate.employee.profilePicture || `https://ui-avatars.com/api/?name=${dashboardData.topCandidate.employee.name}&background=random`}
              alt={dashboardData.topCandidate.employee.name}
              className="h-20 w-20 rounded-full object-cover border-4 border-amber-200 my-4"
            />
            <p className="font-bold text-slate-800">{dashboardData.topCandidate.employee.name}</p>
            <p className="text-sm text-slate-500">Score: {dashboardData.topCandidate.totalScore}</p>
            <div className="mt-2 flex gap-2">
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">C: {dashboardData.topCandidate.stats.Completed.count}</span>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800">M: {dashboardData.topCandidate.stats.Moderate.count}</span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center text-center justify-center border border-slate-200">
            <TrophyIcon className="h-12 w-12 text-slate-300" />
            <h3 className="text-lg font-bold text-slate-500 mt-2">Top Performer</h3>
            <p className="text-sm text-slate-400 mt-2">No candidate data for this month yet.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-10 mt-8 text-blue-300 text-xs">
        &copy; {new Date().getFullYear()} StarTrack Portal
      </div>
    </div>
  );
};

export default Dashboard;