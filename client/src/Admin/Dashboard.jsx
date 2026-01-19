import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { UsersIcon, BriefcaseIcon, ClockIcon, TrophyIcon, CheckBadgeIcon, MegaphoneIcon } from '@heroicons/react/24/outline';
import { useGetDashboardStatsQuery, useGetAllTasksQuery, useGetEmployeeOfTheMonthCandidatesQuery, useGetActiveAnnouncementQuery } from '../services/EmployeApi';
import GooglePieChart from './GooglePieChart.jsx';

const formatDueDate = (dateString) => {
  if (!dateString) return 'N/A';
  // Create dates in a way that ignores time and timezone for comparison
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const dateObj = new Date(dateString);
  const dateObjStart = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());

  if (dateObjStart.getTime() === todayStart.getTime()) {
    return 'Today';
  }
  return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const Countdown = ({ toDate }) => {
  const calculateTimeLeft = useCallback(() => {
    const difference = +new Date(toDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      };
    }
    return timeLeft;
  }, [toDate]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    // Set up an interval to update the countdown every minute
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000); // 60000 ms = 1 minute

    // Clear the interval when the component unmounts or toDate changes
    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  if (!timeLeft.days && !timeLeft.hours) return <span className="text-yellow-300">Expires soon</span>;

  return (
    <span className="text-yellow-300">
      {timeLeft.days > 0 && `${timeLeft.days}d `}
      {timeLeft.hours > 0 && `${timeLeft.hours}h `}
      left
    </span>
  );
};

const Dashboard = ({ onNavigate }) => {
  const { data: stats, isLoading: isLoadingStats } = useGetDashboardStatsQuery();
  const { data: allTasks = [], isLoading: isLoadingTasks } = useGetAllTasksQuery();
  const { data: eomCandidates = [], isLoading: isLoadingEOM } = useGetEmployeeOfTheMonthCandidatesQuery({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const { data: announcement, isLoading: isLoadingAnnouncement } = useGetActiveAnnouncementQuery();

  const isLoading = isLoadingStats || isLoadingTasks || isLoadingEOM || isLoadingAnnouncement;

  const dashboardData = useMemo(() => {
    if (isLoading) return null;

    const topCandidate = eomCandidates[0];

    const taskChartData = [
      { name: 'Pending', value: allTasks.filter(t => t.status === 'Pending').length },
      { name: 'In Progress', value: allTasks.filter(t => t.status === 'In Progress').length },
      { name: 'Verification', value: stats?.tasksPendingVerification || 0 },
      { name: 'Completed', value: allTasks.filter(t => t.status === 'Completed').length },
    ].filter(entry => entry.value > 0);

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const tasksCompletedThisMonth = allTasks.filter(t => 
      t.status === 'Completed' && 
      t.completionDate && new Date(t.completionDate) >= startOfMonth
    ).length;

    return {
      totalEmployees: stats?.totalEmployees ?? 0,
      activeDepartments: stats?.employeesPerDepartment?.length ?? 0,
      tasksPendingVerification: stats?.tasksPendingVerification ?? 0,
      totalTasks: stats?.totalTasks ?? 0,
      topCandidate,
      taskChartData,
      upcomingManagerTask: stats?.upcomingManagerTask,
      tasksCompletedThisMonth,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:bg-black font-manrope relative overflow-hidden dark:text-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 text-white dark:text-black rounded-b-3xl shadow-xl mb-12 overflow-hidden p-8">
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/10 dark:bg-black/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg">Welcome, Admin!</h1>
            <p className="mt-3 text-lg text-blue-100/90 font-medium">Here’s a vibrant snapshot of your organization’s performance.</p>
          </div>
          {dashboardData.upcomingManagerTask && (
            <div className="bg-white/10 p-4 rounded-2xl text-center">
              <p className="text-sm font-semibold text-blue-200">Upcoming Manager Deadline</p>
              <p className="text-2xl font-bold text-yellow-300">{formatDueDate(dashboardData.upcomingManagerTask.dueDate)}</p>
              <p className="text-xs font-medium text-blue-200">for {dashboardData.upcomingManagerTask.assignedTo.name}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 -mt-20 z-20 relative">
        <div
          onClick={() => onNavigate && onNavigate('employees')}
          className="bg-white dark:bg-black rounded-2xl shadow-xl p-6 flex flex-col items-center border-t-4 border-blue-500 hover:scale-105 transition-transform duration-300 cursor-pointer"
        >
          <UsersIcon className="h-10 w-10 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{dashboardData.totalEmployees}</p>
          <p className="text-sm font-semibold text-gray-500 dark:text-white">Total Employees</p>
        </div>
        <div
          onClick={() => onNavigate && onNavigate('view-tasks')}
          className="bg-white dark:bg-black rounded-2xl shadow-xl p-6 flex flex-col items-center border-t-4 border-purple-500 hover:scale-105 transition-transform duration-300 cursor-pointer"
        >
          <BriefcaseIcon className="h-10 w-10 text-purple-500 mb-2" />
          <p className="text-2xl font-bold text-purple-700">{dashboardData.totalTasks}</p>
          <p className="text-sm font-semibold text-gray-500 dark:text-white">Total Tasks</p>
        </div>
        <div
          onClick={() => onNavigate && onNavigate('task-approvals')}
          className="bg-white dark:bg-black rounded-2xl shadow-xl p-6 flex flex-col items-center border-t-4 border-amber-500 hover:scale-105 transition-transform duration-300 cursor-pointer"
        >
          <ClockIcon className="h-10 w-10 text-amber-500 mb-2" />
          <p className="text-2xl font-bold text-amber-700">{dashboardData.tasksPendingVerification}</p>
          <p className="text-sm font-semibold text-gray-500 dark:text-white">Pending Approvals</p>
        </div>
        {announcement ? (
          <div
            onClick={() => onNavigate && onNavigate('announcements')}
            className="bg-indigo-600 text-white dark:text-black rounded-2xl shadow-xl p-6 flex flex-col justify-between hover:scale-105 transition-transform duration-200 cursor-pointer relative overflow-hidden"
          >
            <MegaphoneIcon className="absolute -right-4 -bottom-4 h-28 w-28 text-white/10" />
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="animate-pulse-slow"><MegaphoneIcon className="h-6 w-6" /></div>
                <p className="text-xs font-semibold uppercase tracking-wider">Announcement</p>
              </div>
              <p className="text-xl font-bold mt-2 break-words">{announcement.title}</p>
                <p className="text-sm text-indigo-200 mt-1 break-words line-clamp-2">{announcement.content}</p>
                {announcement.endDate && (
                  <p className="text-xs font-semibold mt-3">
                    <Countdown toDate={announcement.endDate} />
                  </p>
                )}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-black rounded-2xl shadow-xl p-6 flex flex-col items-center border-t-4 border-green-500 hover:scale-105 transition-transform duration-300 cursor-pointer" onClick={() => onNavigate({ component: 'view-tasks', props: { initialFilters: { status: 'Completed' } } })}>
            <CheckBadgeIcon className="h-10 w-10 text-green-500 mb-2" />
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">{dashboardData.tasksCompletedThisMonth}</p>
            <p className="text-sm font-semibold text-gray-500 dark:text-white">Completed This Month</p>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 px-4 mt-16 mb-16">
        <div className="lg:col-span-2 bg-white/80 dark:bg-black/80 backdrop-blur-lg rounded-2xl border border-blue-100 dark:border-slate-700 shadow-2xl p-8 flex flex-col items-center justify-center hover:shadow-3xl transition-shadow duration-300 relative overflow-hidden">
          <div className="absolute -top-10 -left-10 h-32 w-32 bg-blue-200 opacity-20 rounded-full blur-2xl"></div>
          <h3 className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 tracking-tight z-10">Overall Task Status</h3>
          {dashboardData.totalTasks > 0 ? (
            <div className="relative w-full h-[500px]">
              <GooglePieChart data={dashboardData.taskChartData} title="" colors={TASK_COLORS} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-5xl font-bold text-slate-800 dark:text-white">{dashboardData.totalTasks}</p>
                <p className="text-sm font-semibold text-slate-500 dark:text-white">Total Tasks</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 dark:text-white">No task data available.</div>
          )}
        </div>

        {dashboardData.topCandidate ? (
          <div className="bg-white dark:bg-black rounded-2xl shadow-xl p-6 flex flex-col items-center text-center border border-slate-200 dark:border-slate-700">
            <TrophyIcon className="h-12 w-12 text-amber-400" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-2">Top Performer This Month</h3>
            <img src={dashboardData.topCandidate.employee.profilePicture || `https://ui-avatars.com/api/?name=${dashboardData.topCandidate.employee.name}&background=random`} alt={dashboardData.topCandidate.employee.name} className="h-20 w-20 rounded-full object-cover border-4 border-amber-200 my-4" />
            <p className="font-bold text-slate-800 dark:text-white">{dashboardData.topCandidate.employee.name}</p>
            <div className="flex items-center gap-4 mt-1 dark:text-white">
              <p className="text-sm text-slate-500">Avg. Completion: <span className="font-bold text-lg text-amber-600">{dashboardData.topCandidate.totalScore.toFixed(1)}%</span></p>
              <p className="text-sm text-slate-500">Avg. Earliness: <span className="font-bold text-lg text-green-600">{(dashboardData.topCandidate.averageEarliness / (1000 * 60 * 60)).toFixed(1)}h</span></p>
            </div>

            <div className="mt-3">
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">{dashboardData.topCandidate.totalTasks} tasks this month</span>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-black rounded-2xl shadow-xl p-6 flex flex-col items-center text-center justify-center border border-slate-200 dark:border-slate-700">
            <TrophyIcon className="h-12 w-12 text-slate-300" />
            <h3 className="text-lg font-bold text-slate-500 mt-2">Top Performer</h3>
            <p className="text-sm text-slate-400 dark:text-white mt-2">No candidate data for this month yet.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-10 mt-8 text-blue-300 dark:text-white text-xs">
        &copy; {new Date().getFullYear()} Work Radar
      </div>
    </div>
  );
};

export default Dashboard;