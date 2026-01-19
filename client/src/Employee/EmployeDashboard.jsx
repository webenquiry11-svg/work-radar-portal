import React, { useState, useEffect, useMemo } from 'react';
import { useGetTodaysReportQuery, useUpdateTodaysReportMutation, useGetEmployeesQuery, useGetHolidaysQuery, useGetMyTasksQuery, useGetAllTasksQuery, useGetAllMyReportsQuery, useGetActiveAnnouncementQuery, useGetEmployeeEOMHistoryQuery, useProcessPastDueTasksMutation, useUpdateEmployeeMutation } from '../services/EmployeApi';
import { apiSlice } from '../services/apiSlice';
import toast from 'react-hot-toast';
import { ArrowPathIcon, PaperAirplaneIcon, DocumentTextIcon, BriefcaseIcon, CheckCircleIcon, HomeIcon, ChartBarIcon, UserGroupIcon, InformationCircleIcon, CalendarDaysIcon, ClipboardDocumentListIcon, CheckBadgeIcon, ArchiveBoxIcon, TrophyIcon, StarIcon, ShieldCheckIcon, ExclamationTriangleIcon, ClockIcon, CalendarIcon, ChevronDoubleLeftIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { EyeIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '../app/authSlice';
import PastReportsList from './PastReports';
import AttendanceCalendar from '../services/AttendanceCalendar';
import TaskApprovals from '../Admin/TaskApprovals';
import ThemeToggle from '../ThemeToggle.jsx';
import AssignTask from '../Senior/AssignTask.jsx'; 
import AnnouncementWidget from '../services/AnnouncementWidget.jsx';
import starPublicityLogo from '../assets/starpublicity.png';
import volgaInfosysLogo from '../assets/volgainfosys.png';
import ViewTeamTasks from '../Senior/ViewTeamTasks.jsx';
import { TaskDetailsModal } from '../Admin/TaskOverview.jsx';
import { TeamReports } from '../Admin/AdminDashboard.jsx';
import GooglePieChart from '../Admin/GooglePieChart.jsx';
import AppHeader from '../app/AppHeader.jsx';

export const Dashboard = ({ user, onNavigate }) => {
  const { data: tasks = [], isLoading } = useGetMyTasksQuery(undefined, { pollingInterval: 30000 });
  const { data: announcement } = useGetActiveAnnouncementQuery();

  // Find next due date for user's own tasks
  const nextMyTaskDueDate = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to midnight for date-only comparison
    const upcoming = tasks
      .filter(task => task.dueDate && !['Completed', 'Not Completed', 'Pending Verification'].includes(task.status) && new Date(task.dueDate) >= today)
      .map(task => new Date(task.dueDate))
      .sort((a, b) => a - b);
    return upcoming.length > 0 ? upcoming[0] : null;
  }, [tasks]);

  const stats = useMemo(() => {
    const taskStats = { active: 0 };
    const gradeStats = { Completed: 0, Moderate: 0, Low: 0, Pending: 0 };
    const recentTasks = [];

    tasks.forEach(task => {
      if (!['Completed', 'Not Completed', 'Pending Verification'].includes(task.status)) {
        taskStats.active++;
        recentTasks.push(task);
      } else if (task.status === 'Completed' || task.status === 'Not Completed') {
        if (task.completionCategory) {
          gradeStats[task.completionCategory] = (gradeStats[task.completionCategory] || 0) + 1;
        }
      } else if (task.status === 'Pending Verification') {
        recentTasks.push(task);
      }
    });

    const sortedRecentTasks = recentTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    return { taskStats, gradeStats, recentTasks: sortedRecentTasks, totalTasks: tasks.length };
  }, [tasks]);

  const GradeCard = ({ label, value, icon: Icon, colorClass }) => (
    <div className={`p-4 rounded-xl flex items-center gap-4 shadow-md ${colorClass}`}>
      <Icon className="h-8 w-8 text-white" />
      <div className="text-white">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm font-medium">{label}</p>
      </div>
    </div>
  );

  const formatDueDate = (dateObj) => {
    if (!dateObj) return 'N/A';
    const today = new Date();
    if (
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear()
    ) {
      return 'Today';
    }
    return dateObj.toLocaleDateString();
  };

  if (isLoading) return <div className="p-8 text-center">Loading dashboard...</div>;

  // --- Redesigned Employee Dashboard ---
  return (
    <div className="p-0 min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 font-manrope">
      <AnnouncementWidget />
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 text-white rounded-b-3xl shadow-xl mb-12 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 px-4 sm:px-8 py-10 sm:py-12 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 md:gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg text-center md:text-left">Welcome, {user.name}!</h1>
            <p className="mt-3 text-base sm:text-lg text-blue-100/90 font-medium text-center md:text-left">Here’s your daily snapshot. Stay productive and keep growing!</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 -mt-24 sm:-mt-20 z-20 relative">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 flex flex-col items-center border-t-4 border-blue-500 hover:scale-105 transition-transform duration-200">
          <ClipboardDocumentListIcon className="h-10 w-10 text-blue-500 mb-2" /> 
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.taskStats.active}</p>
          <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">Active Tasks</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 flex flex-col items-center border-t-4 border-emerald-500 hover:scale-105 transition-transform duration-200">
          <TrophyIcon className="h-10 w-10 text-emerald-500 mb-2" />
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{stats.gradeStats.Completed}</p>
          <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">Completed</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 flex flex-col items-center border-t-4 border-blue-500 hover:scale-105 transition-transform duration-200">
          <ShieldCheckIcon className="h-10 w-10 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.gradeStats.Moderate}</p>
          <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">Moderate</p>
        </div>
        {announcement ? (
          <div className="bg-indigo-600 text-white rounded-2xl shadow-xl p-6 flex flex-col justify-between relative overflow-hidden">
            <MegaphoneIcon className="absolute -right-4 -bottom-4 h-28 w-28 text-white/10" />
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="animate-pulse-slow"><MegaphoneIcon className="h-6 w-6" /></div>
                <p className="text-xs font-semibold uppercase tracking-wider">Announcement</p>
              </div>
              <p className="text-xl font-bold mt-2 break-words">{announcement.title}</p>
              <p className="text-sm text-indigo-200 mt-1 break-words">{announcement.content}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 flex flex-col items-center border-t-4 border-amber-500 hover:scale-105 transition-transform duration-200"><StarIcon className="h-10 w-10 text-amber-500 mb-2" /><p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{stats.gradeStats.Low}</p><p className="text-sm font-semibold text-gray-500 dark:text-slate-400">Low</p></div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions & Performance */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button onClick={() => onNavigate('my-report')} className="w-full flex items-center gap-3 text-left p-4 bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg font-semibold text-blue-700 dark:text-blue-300 transition-colors">
                <DocumentTextIcon className="h-6 w-6" />
                <span>Update Today's Report</span>
              </button>
              <button onClick={() => onNavigate('my-tasks')} className="w-full flex items-center gap-3 text-left p-4 bg-slate-50 hover:bg-slate-100 rounded-lg font-semibold text-slate-700 transition-colors">
                <ClipboardDocumentListIcon className="h-6 w-6" />
                <span>View All My Tasks</span>
              </button>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Performance Snapshot</h3>
            <div className="grid grid-cols-2 gap-4">
              <GradeCard label="Completed" value={stats.gradeStats.Completed || 0} icon={TrophyIcon} colorClass="bg-emerald-500" />
              <GradeCard label="Moderate" value={stats.gradeStats.Moderate || 0} icon={ShieldCheckIcon} colorClass="bg-blue-500" />
              <GradeCard label="Low" value={stats.gradeStats.Low || 0} icon={StarIcon} colorClass="bg-amber-500" />
              <GradeCard label="Pending" value={stats.gradeStats.Pending || 0} icon={ExclamationTriangleIcon} colorClass="bg-red-500" />
            </div>
          </div>
        </div>
        {/* Recent Tasks */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-8">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6">Your Active Tasks</h3>
          <div className="space-y-4"> 
            {stats.recentTasks.length > 0 ? (
              stats.recentTasks.map((task, index) => (
                <div key={task._id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{task.title}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-500">
                <CheckCircleIcon className="h-12 w-12 mx-auto text-green-400" />
                <p className="mt-2 font-semibold">No pending or in-progress tasks!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const StatCard = ({ grade, count }) => {
  const GRADE_COLORS = { 'Avg. Completion': '#10B981', 'Total Tasks': '#3B82F6', 'In Progress': '#F59E0B', 'In Verification': '#8B5CF6', 'Not Completed': '#f97316', 'Completed': '#10B981', 'Moderate': '#3B82F6', 'Low': '#F59E0B', 'Pending': '#EF4444', 'Pending Verification': '#8B5CF6' };
  const GRADE_ICONS = { Completed: TrophyIcon, Moderate: ShieldCheckIcon, Low: StarIcon, Pending: ExclamationTriangleIcon };
  const Icon = GRADE_ICONS[grade] || InformationCircleIcon;
  return (
    <div className="bg-white p-5 rounded-xl shadow-md border border-slate-200 flex items-center gap-4">
      <div className={`p-3 rounded-full`} style={{ backgroundColor: `${GRADE_COLORS[grade]}20` }}>
        <Icon className="h-6 w-6" style={{ color: GRADE_COLORS[grade] }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{count}</p>
        <p className="text-sm font-semibold text-slate-500">{grade}</p>
      </div>
    </div>
  );
};

export const Analytics = ({ user }) => {
  const [view, setView] = useState('my_stats');

  useEffect(() => {
    if (user) {
      if (user.role === 'Admin') {
        setView('org_stats');
      } else if (user.canViewTeam) {
        setView('team_stats');
      } else {
        setView('my_stats');
      }
    }
  }, [user?.role, user?.canViewTeam]);

  const { data: allTasks = [], isLoading: isLoadingAllTasks } = useGetAllTasksQuery(undefined, { pollingInterval: 30000 });
  const { data: allEmployees = [], isLoading: isLoadingEmployees } = useGetEmployeesQuery();
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  const teamMemberIds = useMemo(() => {
    if (!allEmployees || !user?._id) return new Set();
    const subordinates = [];
    const getTeamLeadId = (emp) => emp.teamLead?._id || emp.teamLead;
    const queue = allEmployees.filter(emp => getTeamLeadId(emp) === user._id);
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
  }, [allEmployees, user]);

  const { performanceStats, title } = useMemo(() => {
    const stats = {
      totalTasks: 0,
      totalProgress: 0,
      averageCompletion: 0,
      tasksInVerification: 0,
      tasksInProgress: 0,
      pending: 0,
      inProgress: 0,
      pendingVerification: 0,
      completed: 0,
      notCompleted: 0,
    };
    let relevantTasks = [];
    let viewTitle = '';

    if (view === 'my_stats') {
      relevantTasks = allTasks.filter(task => task.assignedTo?._id === user?._id);
      viewTitle = "My Performance Analytics";
    } else if (view === 'team_stats') {
      relevantTasks = allTasks.filter(task => teamMemberIds.has(task.assignedTo?._id));
      viewTitle = "Team Performance Analytics";
    } else if (view === 'org_stats') {
      relevantTasks = allTasks;
      viewTitle = "Organization Performance Analytics";
    }

    let dateFilteredTasks = relevantTasks;

    if (dateRange.startDate && dateRange.endDate) {
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      end.setHours(23, 59, 59, 999);
      dateFilteredTasks = relevantTasks.filter(task => {
        const assignedDate = new Date(task.createdAt);
        return assignedDate >= start && assignedDate <= end;
      });
    }

    const gradedTasks = dateFilteredTasks.filter(task => task.status === 'Completed' || task.status === 'Not Completed');
    stats.totalTasks = dateFilteredTasks.length;
    gradedTasks.forEach(task => {
      stats.totalProgress += task.progress || 0;
    });
    stats.averageCompletion = gradedTasks.length > 0 ? (stats.totalProgress / gradedTasks.length) : 0;
    stats.tasksInProgress = dateFilteredTasks.filter(t => t.status === 'In Progress').length;
    stats.tasksInVerification = dateFilteredTasks.filter(t => t.status === 'Pending Verification').length;

    dateFilteredTasks.forEach(task => {
      switch(task.status) {
        case 'Pending': stats.pending++; break;
        case 'In Progress': stats.inProgress++; break;
        case 'Pending Verification': stats.pendingVerification++; break;
        case 'Completed': stats.completed++; break;
        case 'Not Completed': stats.notCompleted++; break;
      }
    });

    return { performanceStats: stats, title: viewTitle };
  }, [allTasks, user, view, teamMemberIds, dateRange]);

  const chartData = useMemo(() => {
    if (!performanceStats) return [];
    const { pending, inProgress, pendingVerification, completed, notCompleted } = performanceStats;
    return [
      { name: 'Pending', value: pending },
      { name: 'In Progress', value: inProgress },
      { name: 'Pending Verification', value: pendingVerification },
      { name: 'Completed', value: completed },
      { name: 'Not Completed', value: notCompleted },
    ].filter(item => item.value > 0);
  }, [performanceStats]);

  const GRADE_COLORS = {
    'Avg. Completion': '#10B981',
    'Total Tasks': '#3B82F6',
    'In Progress': '#F59E0B',
    'In Verification': '#8B5CF6',
    'Not Completed': '#f97316',
    'Completed': '#10B981', 'Moderate': '#3B82F6', 'Low': '#F59E0B', 'Pending': '#EF4444',
    'Pending Verification': '#8B5CF6',
  };
  const GRADE_ICONS = { Completed: TrophyIcon, Moderate: ShieldCheckIcon, Low: StarIcon, Pending: ExclamationTriangleIcon };

  if (isLoadingAllTasks || isLoadingEmployees) {
    return <div className="p-8 text-center">Loading analytics...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{title}</h1>
          <p className="text-slate-500 mt-2">An overview of task completion and progress.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 sm:mt-0">
            <div className="flex items-center bg-slate-200 rounded-lg p-1">
              {user?.role === 'Admin' && (
                <button onClick={() => setView('org_stats')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${view === 'org_stats' ? 'bg-white text-blue-600 shadow' : 'text-slate-600'}`}>Org</button>
              )}
              {user?.canViewTeam && (
                <button onClick={() => setView('team_stats')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${view === 'team_stats' ? 'bg-white text-blue-600 shadow' : 'text-slate-600'}`}>Team</button>
              )}
              <button onClick={() => setView('my_stats')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${view === 'my_stats' ? 'bg-white text-blue-600 shadow' : 'text-slate-600'}`}>My Stats</button>
            </div>
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={dateRange.startDate}
              onChange={e => setDateRange(prev => ({...prev, startDate: e.target.value}))}
              className="text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
            <input 
              type="date" 
              value={dateRange.endDate}
              onChange={e => setDateRange(prev => ({...prev, endDate: e.target.value}))}
              className="text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard grade="Avg. Completion" count={`${performanceStats.averageCompletion.toFixed(1)}%`} />
        <StatCard grade="Total Tasks" count={performanceStats.totalTasks} />
        <StatCard grade="In Progress" count={performanceStats.tasksInProgress} />
        <StatCard grade="In Verification" count={performanceStats.tasksInVerification} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-lg p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Active Task Status</h3>
          {chartData.length > 0 ? (
            <GooglePieChart data={chartData} title="" colors={GRADE_COLORS} />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">No graded tasks to display for this view.</div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Metric Definitions</h3>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex gap-3"><strong className="font-semibold text-emerald-600 w-24">Avg. Completion:</strong><span>Average final progress of all graded tasks in the selected range.</span></li>
            <li className="flex gap-3"><strong className="font-semibold text-blue-600 w-24">Total Tasks:</strong><span>All tasks assigned in the selected date range, regardless of status.</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export const MyTasks = () => {
  const { data: myTasks = [], isLoading } = useGetMyTasksQuery(undefined, { pollingInterval: 30000 });
  const [viewingTask, setViewingTask] = useState(null);
  const [viewingTaskNumber, setViewingTaskNumber] = useState(null);
  const [activeTab, setActiveTab] = useState('Active');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    // Set default date range to the current week
    const today = new Date();
    const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
    const lastDay = new Date(firstDay);
    lastDay.setDate(lastDay.getDate() + 6);

    setDateRange({
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0],
    });
  }, []);

  const { stats, tasksToShow } = useMemo(() => {
    let dateFilteredTasks = myTasks;
    if (dateRange.startDate && dateRange.endDate) {
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      end.setHours(23, 59, 59, 999); // Include the whole end day

      dateFilteredTasks = myTasks.filter(task => {
        const assignedDate = new Date(task.createdAt);
        return assignedDate >= start && assignedDate <= end;
      });
    }

    // Use UTC dates for reliable, timezone-agnostic comparison to prevent bugs
    const now = new Date();
    const todayUTCStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    // A task is overdue only if its due date has passed, its progress is less than 100%,
    // AND it is still an active task (not Completed, Not Completed, or Pending Verification).
    const overdue = dateFilteredTasks.filter(t => t.progress < 100 && ['Pending', 'In Progress'].includes(t.status) && t.dueDate && new Date(t.dueDate) < todayUTCStart);
    // Active tasks are those not yet graded and not in the overdue list.
    const activeAndNotOverdue = dateFilteredTasks.filter(t => !['Completed', 'Not Completed', 'Pending Verification'].includes(t.status) && !overdue.some(ot => ot._id === t._id));
    const completed = dateFilteredTasks.filter(t => ['Completed', 'Not Completed'].includes(t.status));
    
    const stats = {
      active: activeAndNotOverdue.length,
      overdue: overdue.length,
      completed: completed.length,
    };

    let tasks = [];
    if (activeTab === 'Active') {
      tasks = activeAndNotOverdue;
    } else if (activeTab === 'Completed') {
      tasks = completed; 
    } else { // 'All' tab
      tasks = dateFilteredTasks;
    }

    return { stats, tasksToShow: tasks };
  }, [myTasks, activeTab, dateRange]);

  if (isLoading) {
    return <div className="p-8 text-center">Loading tasks...</div>;
  }

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className={`bg-white p-5 rounded-xl shadow-lg border border-slate-200 flex items-center gap-4`}>
      <div className={`p-3 rounded-full ${color.bg}`}>
        <Icon className={`h-6 w-6 ${color.text}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm font-semibold text-slate-500">{title}</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col bg-slate-50/50">
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">My Tasks</h1>
        <p className="text-slate-500 mt-2">Stay on top of your assigned tasks and deadlines.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatCard title="Active Tasks" value={stats.active} icon={ClipboardDocumentListIcon} color={{ bg: 'bg-blue-100', text: 'text-blue-600' }} />
        <StatCard title="Overdue" value={stats.overdue} icon={ExclamationTriangleIcon} color={{ bg: 'bg-red-100', text: 'text-red-600' }} />
        <StatCard title="Completed" value={stats.completed} icon={CheckCircleIcon} color={{ bg: 'bg-emerald-100', text: 'text-emerald-600' }} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-lg flex-1 flex flex-col">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            {['All', 'Active', 'Completed'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === tab ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}>
                {tab}
              </button>
            ))}
          </div>
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
        </div>

        <div className="flex-1 overflow-y-auto p-2 sm:p-4">
          {tasksToShow.length > 0 ? (
            <ul className="space-y-4">
              {tasksToShow.map((task, index) => {
                const priorityStyles = { High: 'bg-red-500', Medium: 'bg-amber-500', Low: 'bg-green-500' };
                const statusStyles = { Pending: 'bg-slate-100 text-slate-800', 'In Progress': 'bg-blue-100 text-blue-800', Completed: 'bg-emerald-100 text-emerald-800', 'Pending Verification': 'bg-purple-100 text-purple-800', 'Not Completed': 'bg-orange-100 text-orange-800' };

                const now = new Date();
                const todayUTCStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
                const isOverdue = !['Completed', 'Not Completed', 'Pending Verification'].includes(task.status) && task.dueDate && new Date(task.dueDate) < todayUTCStart;
                return (
                  <li key={task._id} className="bg-white rounded-xl shadow-md border border-slate-100 p-4 group flex flex-col sm:flex-row sm:items-center gap-y-2 gap-x-4">
                    <span className={`flex-shrink-0 h-2.5 w-2.5 rounded-full ${priorityStyles[task.priority]}`} title={`${task.priority} Priority`}></span>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800">{task.title}</h3>
                      <p className={`text-xs mt-1 ${isOverdue ? 'font-bold text-red-600' : 'text-slate-500'}`}>
                        Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                      </p>
                      {['Completed', 'Not Completed'].includes(task.status) && (
                        <p className="text-xs mt-1 text-slate-500">
                          {task.status === 'Not Completed' ? (
                            <span className="font-bold text-orange-600">Incomplete</span>
                          ) : (
                            <span>Completed: {task.completionDate ? new Date(task.completionDate).toLocaleDateString() : 'N/A'}</span>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="w-full sm:w-auto md:w-1/4 flex items-center gap-2">
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${task.progress}%` }}></div>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 w-10 text-right">{task.progress}%</span>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full self-start sm:self-center ${statusStyles[task.status]}`}>{task.status}</span>
                    <button onClick={() => { setViewingTask(task); setViewingTaskNumber(index + 1); }} className="text-xs font-semibold text-blue-600 hover:underline sm:opacity-0 sm:group-hover:opacity-100 transition-opacity self-end sm:self-center">Details</button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center py-16 text-slate-500">
              <ClipboardDocumentListIcon className="h-12 w-12 mx-auto text-slate-400" />
              <p className="mt-2 font-semibold">No {activeTab.toLowerCase()} tasks.</p>
            </div>
          )}
        </div>
      </div>
      <TaskDetailsModal
        isOpen={!!viewingTask}
        onClose={() => setViewingTask(null)}
        task={viewingTask}
        taskNumber={viewingTaskNumber}
      />
    </div>
  );
};

export const MyReportHistory = ({ employeeId }) => {
  const { data: reports = [], isLoading } = useGetAllMyReportsQuery(employeeId);
  const [expandedReportId, setExpandedReportId] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [viewingTaskNumber, setViewingTaskNumber] = useState(null);

  useEffect(() => {
    if (reports.length > 0 && !expandedReportId) {
      setExpandedReportId(reports[0]._id);
    }
  }, [reports, expandedReportId]);

  const renderReportContent = (content) => {
    try {
      const data = JSON.parse(content);
      if (data.taskUpdates) {
        return (
          <div className="space-y-3 p-6 bg-slate-50">
            {data.taskUpdates.map((update, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <p className="font-semibold text-slate-800">{update.taskId?.title || 'Unknown Task'}</p>
                  <button onClick={() => { setViewingTask(update.taskId); setViewingTaskNumber(i + 1); }} className="text-xs font-semibold text-blue-600 hover:underline">Details</button>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${update.completion}%` }}></div>
                  </div>
                  <span className="text-sm font-bold text-blue-600 w-12 text-right tabular-nums">{update.completion}%</span>
                </div>
              </div>
            ))}
          </div>
        );
      }
      return <p className="whitespace-pre-wrap text-sm text-slate-600">{JSON.stringify(data, null, 2)}</p>;
    } catch (e) {
      return <p className="whitespace-pre-wrap text-sm text-slate-600">{content}</p>;
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading report history...</div>;
  }

  return ( 
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col bg-slate-50/50 font-manrope">
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">My Report History</h1>
        <p className="text-slate-500 mt-2">Review your previously submitted daily progress reports.</p>
      </div>
      <div className="space-y-4">
        {reports.length > 0 ? (
          reports.map(report => (
            <div key={report._id} className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden transition-all duration-300">
              <button onClick={() => setExpandedReportId(expandedReportId === report._id ? null : report._id)} className="w-full text-left p-5 flex justify-between items-center hover:bg-slate-50/50">
                <span className="font-bold text-slate-800">{new Date(report.reportDate).toLocaleDateString('en-US', { dateStyle: 'full' })}</span>
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${report.status === 'Submitted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{report.status}</span>
                  <ChevronDownIcon className={`h-5 w-5 text-slate-500 transition-transform ${expandedReportId === report._id ? 'rotate-180' : ''}`} />
                </div>
              </button>
              {expandedReportId === report._id && renderReportContent(report.content)}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-white rounded-2xl border-2 border-dashed p-16">
            <ArchiveBoxIcon className="h-16 w-16 text-slate-400 mb-4" />
            <p className="font-semibold">No Report History Found</p>
            <p className="text-sm">You have not submitted any reports yet.</p>
          </div>
        )}
      </div>
      <TaskDetailsModal isOpen={!!viewingTask} onClose={() => setViewingTask(null)} task={viewingTask} taskNumber={viewingTaskNumber} />
    </div>
  );
};

export const TeamInformation = ({ seniorId }) => {
  const { data: allEmployees, isLoading: isLoadingEmployees } = useGetEmployeesQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const teamMembers = useMemo(() => {
    if (!allEmployees || !seniorId) return [];

    const getAllSubordinates = (managerId, employees) => {
      const subordinates = [];
      const getTeamLeadId = (emp) => emp.teamLead?._id || emp.teamLead;
      const queue = employees.filter(emp => getTeamLeadId(emp) === managerId);
      const visited = new Set(queue.map(e => e._id));

      while (queue.length > 0) {
        const currentEmployee = queue.shift();
        subordinates.push(currentEmployee);

        const directReports = employees.filter(emp => getTeamLeadId(emp) === currentEmployee._id);
        for (const report of directReports) {
          if (!visited.has(report._id)) {
            visited.add(report._id);
            queue.push(report);
          }
        }
      }
      return subordinates;
    };

    return getAllSubordinates(seniorId, allEmployees);
  }, [allEmployees, seniorId]);

  useEffect(() => {
    if (teamMembers.length > 0 && !selectedEmployee) {
      setSelectedEmployee(teamMembers[0]);
    } else if (teamMembers.length === 0) {
      setSelectedEmployee(null);
    }
  }, [teamMembers, selectedEmployee]);

  const filteredTeamMembers = useMemo(() => {
    if (!searchTerm) return teamMembers;
    return teamMembers.filter(emp =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [teamMembers, searchTerm]);

  if (isLoadingEmployees) {
    return <div className="p-8 text-center">Loading team information...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col bg-slate-50/50 font-manrope">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Team Information</h1>
        <p className="text-slate-500 mt-2">View details and attendance for your team members.</p>
      </div>
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-6 md:gap-8">
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-lg flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">Team Members ({teamMembers.length})</h2>
            <input type="text" placeholder="Search team..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="mt-3 w-full text-sm border-slate-300 rounded-lg p-2 focus:ring-blue-500" />
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {filteredTeamMembers.map(employee => (
              <button key={employee._id} onClick={() => setSelectedEmployee(employee)} className={`w-full text-left p-3 my-1 rounded-lg transition-all flex items-center gap-3 ${selectedEmployee?._id === employee._id ? 'bg-blue-100' : 'hover:bg-slate-100'}`}>
                <img src={employee.profilePicture || `https://ui-avatars.com/api/?name=${employee.name}&background=random`} alt={employee.name} className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <p className={`font-semibold ${selectedEmployee?._id === employee._id ? 'text-blue-800' : 'text-slate-800'}`}>{employee.name}</p>
                  <p className="text-xs text-slate-500">{employee.role}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="xl:col-span-3">
          {selectedEmployee ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                <img src={selectedEmployee.profilePicture || `https://ui-avatars.com/api/?name=${selectedEmployee.name}&background=random`} alt={selectedEmployee.name} className="h-20 w-20 rounded-full object-cover" />
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">{selectedEmployee.name}</h3>
                  <p className="text-slate-500">{selectedEmployee.role} &middot; {selectedEmployee.department}</p>
                  <p className="text-sm text-slate-400 font-mono">{selectedEmployee.employeeId}</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Attendance Calendar</h3>
              <AttendanceCalendar employeeId={selectedEmployee._id} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-white rounded-2xl border-2 border-dashed p-8">
              <UserGroupIcon className="h-16 w-16 text-slate-400 mb-4" />
              <p className="font-semibold">No Team Members Found</p>
              <p className="text-sm">You do not have any team members assigned to you.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const MyDailyReport = ({ employeeId }) => {
  const { data: assignedTasks = [], isLoading: isLoadingTasks } = useGetMyTasksQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: todaysReport, isLoading: isLoadingReport } = useGetTodaysReportQuery(employeeId);
  const [updateTodaysReport, { isLoading: isUpdating }] = useUpdateTodaysReportMutation();
  const [progress, setProgress] = useState({});
  
  const isReadOnly = useMemo(() => {
    const now = new Date();
    const isPastCutoff = now.getHours() >= 19; // 7:00 PM
    const isSubmitted = todaysReport?.status === 'Submitted';
    return isPastCutoff || isSubmitted;
  }, [todaysReport]);

  const isTaskReadOnly = (task) => {
    // A task is read-only if the main report is read-only.
    // We allow editing rejected tasks (which are In Progress) so the employee can correct them.
    return isReadOnly;
  };

  useEffect(() => {
    // Initialize or update progress state when tasks or the report status changes
    const initialProgress = {};
    if (todaysReport?.status === 'Submitted') {
      // If already submitted, try to parse and show the submitted values
      try {
        const content = JSON.parse(todaysReport.content);
        content.taskUpdates.forEach(update => {
          initialProgress[update.taskId] = update.completion;
        });
      } catch (e) { /* ignore parsing errors */ }
    } else {
      // If not submitted or reopened, initialize from the task's last known progress
      assignedTasks.forEach(task => {
        initialProgress[task._id] = task.progress || 0;
      });
    } 
    setProgress(initialProgress);
  }, [assignedTasks, todaysReport]);

  const handleProgressChange = (taskId, value) => {
    setProgress(prev => ({ ...prev, [taskId]: parseInt(value, 10) || 0 }));
  };

  const handleSubmit = async () => {
    const taskUpdates = Object.entries(progress)
      .map(([taskId, completion]) => ({ taskId, completion }));

    if (taskUpdates.length === 0) {
      // If there are no tasks to report on, still allow submitting an empty report for attendance.
      toast.info('Submitting attendance for today.', { icon: '👍' });
    }

    try {
      await updateTodaysReport({
        employeeId: employeeId,
        content: JSON.stringify({ taskUpdates }),
        status: 'Submitted',
      }).unwrap();
      toast.success('Progress submitted successfully!');
    } catch (err) {
      toast.error(err.data?.message || "Error in submitting today's report");
    }
  };

  const tasksToDisplay = useMemo(() => {
    const now = new Date();
    // Use UTC for consistent date comparison with the server.
    const todayUTCStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    return assignedTasks.filter(task => {
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      const isNotFinalized = !['Completed', 'Not Completed', 'Pending Verification'].includes(task.status);
      const isNotPastDue = !dueDate || dueDate >= todayUTCStart;
      return isNotFinalized && isNotPastDue;
    });
  }, [assignedTasks]);

  if (isLoadingTasks || isLoadingReport) {
    return <div className="text-center p-10">Loading Report...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto bg-slate-50/50 dark:bg-slate-900">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">Today's Progress Report</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Update the completion status for your active tasks.</p>
        </div>
        {!isReadOnly && (
          <button onClick={handleSubmit} disabled={isUpdating} className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl text-sm disabled:bg-blue-400 transition-colors shadow-lg shadow-blue-500/30 dark:shadow-blue-800/50">
            {isUpdating ? <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" /> : <PaperAirplaneIcon className="h-5 w-5 mr-2" />}
            Submit Progress
          </button>
        )}
      </div>

      {isReadOnly && (
        <div className="bg-gradient-to-r from-amber-100 to-yellow-100 border-l-4 border-amber-500 text-amber-800 p-4 mb-6 rounded-r-lg shadow-sm dark:bg-amber-500/10 dark:text-amber-300" role="alert">
          <p className="font-bold">Reporting Closed for Today</p>
          <p className="text-sm">You can submit progress once daily before 7:00 PM. Today's report may have already been submitted or the deadline has passed.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tasksToDisplay.map((task, index) => ( 
          <div key={task._id} className="bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 flex flex-col">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700"> 
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                Task {index + 1}: {task.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{task.description}</p>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-5">
                <span className={`font-bold w-16 text-center text-2xl tabular-nums ${isReadOnly ? 'text-slate-500' : 'text-blue-600'}`}>
                  {progress[task._id] || 0}%
                </span>
                <div className="relative w-full h-4 flex items-center">
                  <div className="absolute h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                  <div
                    className="absolute h-1.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                    style={{ width: `${progress[task._id] || 0}%` }}
                  ></div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={progress[task._id] ?? 0}
                    onChange={(e) => handleProgressChange(task._id, e.target.value)}
                        disabled={isTaskReadOnly(task)}
                    className="w-full h-4 bg-transparent appearance-none cursor-pointer disabled:cursor-not-allowed slider-thumb"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
        {tasksToDisplay.length === 0 && (
          <div className="lg:col-span-2 text-center py-16 text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-dashed dark:border-slate-700">
            <CheckCircleIcon className="h-12 w-12 mx-auto text-green-400" />
            <p className="mt-4 font-semibold text-lg">All tasks are completed!</p>
            <p className="text-sm">No pending tasks to report on.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const MyAttendance = ({ employeeId }) => {
  const { data: holidays = [], isLoading: isLoadingHolidays } = useGetHolidaysQuery(); 

  const legendItems = [
    { label: 'Present', color: 'bg-emerald-500' },
    { label: 'Absent', color: 'bg-red-500' },
    { label: 'Holiday', color: 'bg-amber-500' },
    { label: 'Leave', color: 'bg-sky-500' },
    { label: 'Future', color: 'bg-slate-200' },
  ];

  const upcomingHolidays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return holidays
      .filter(h => new Date(h.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [holidays]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col bg-slate-50/50"> 
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">My Attendance</h1>
        <p className="text-slate-500 mt-2">Review your monthly attendance record.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
          <AttendanceCalendar employeeId={employeeId} />
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Legend</h3>
            <div className="space-y-3">
              {legendItems.map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className={`h-4 w-4 rounded-full ${item.color}`}></span>
                  <span className="text-sm font-medium text-slate-600">{item.label}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-6 italic">Click on a date to apply for leave. Sundays are default holidays.</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Upcoming Holidays</h3>
            <div className="space-y-3">
              {isLoadingHolidays ? <p className="text-sm text-slate-400">Loading...</p> : upcomingHolidays.length > 0 ? upcomingHolidays.slice(0, 5).map(holiday => (
                <div key={holiday._id} className="p-3 rounded-lg bg-amber-50">
                  <p className="font-semibold text-sm text-amber-800">{holiday.name}</p>
                  <p className="text-xs text-amber-600">{new Date(holiday.date).toLocaleDateString('en-US', { dateStyle: 'long', timeZone: 'UTC' })}</p>
                </div>
              )) : (
                <p className="text-sm text-slate-400">No upcoming holidays found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const EmployeeProfile = ({ user }) => {
  const dispatch = useDispatch();
  const [isEditMode, setIsEditMode] = useState(false);
  const [updateProfile, { isLoading: isUpdating }] = useUpdateEmployeeMutation();
  const token = useSelector(state => state.auth.token);
  const { data: eomHistory = [] } = useGetEmployeeEOMHistoryQuery(user._id, {
    skip: !user,
  });
  const monthNames = useMemo(() => ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], []);

  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    profilePicture: null,
    address: user.address || '',
    gender: user.gender || '',
    country: user.country || '',
    city: user.city || '',
    qualification: user.qualification || '',
  });

  // When edit mode is toggled, reset the form data to the current user prop
  useEffect(() => {
    if (user && isEditMode) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        profilePicture: null, // Don't try to pre-fill file input
        address: user.address || '',
        gender: user.gender || '',
        country: user.country || '',
        city: user.city || '',
        qualification: user.qualification || '',
      });
    }
  }, [user, isEditMode]);

  const handleChange = (e) => {
    if (e.target.type === 'file') {
      setFormData({ ...formData, profilePicture: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSave = async () => {
    const profileData = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'profilePicture' && formData.profilePicture) {
        profileData.append(key, formData.profilePicture);
      } else if (formData[key] != null) {
        profileData.append(key, formData[key]);
      }
    });

    try {
      const updatedData = await updateProfile({ id: user._id, formData: profileData }).unwrap();
      toast.success('Profile updated successfully!', { icon: <CheckCircleIcon className="h-6 w-6 text-green-500" /> });
      if (updatedData.employee) {
        dispatch(setCredentials({ user: updatedData.employee, token }));
      }
      setIsEditMode(false);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to update profile.');
      console.error('Failed to update profile:', err);
    }
  };

  const InfoField = ({ label, value }) => (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-md font-semibold text-gray-800">{value || 'N/A'}</p>
    </div>
  );

  const EditField = ({ label, name, value, onChange, type = 'text' }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        className="mt-1 w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl border border-gray-200 dark:border-slate-700 shadow-xl p-4 sm:p-8">
      <div className="flex justify-between items-start mb-8 pb-8 border-b border-gray-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8">
        <img
          src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
          alt="Profile"
          className="h-32 w-32 rounded-full object-cover border-4 border-blue-200 shadow-lg"
        />
        <div>
          <h2 className="text-3xl font-bold text-blue-800 dark:text-slate-200">{user.name}</h2>
          <p className="text-gray-600 dark:text-slate-400">{user.role}</p>
          <p className="text-sm text-gray-500 dark:text-slate-500 font-mono mt-1">{user.employeeId}</p>
        </div>
      </div>
        {user.canEditProfile && (
          <button onClick={() => setIsEditMode(!isEditMode)} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors">
            {isEditMode ? 'Cancel' : 'Edit Profile'}
          </button>
        )}
      </div>

      {eomHistory.length > 0 && !isEditMode && (
        <div className="mb-8">
          <h4 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-3">Hall of Fame</h4>
          <div className="flex flex-wrap gap-2">
            {eomHistory.map((win) => (
              <div key={win._id} className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M8 1.75a.75.75 0 0 1 .692.462l1.41 3.393 3.663.293a.75.75 0 0 1 .428 1.317l-2.79 2.39.853 3.575a.75.75 0 0 1-1.12.814L8 11.97l-3.126 1.92a.75.75 0 0 1-1.12-.814l.852-3.574-2.79-2.39a.75.75 0 0 1 .427-1.318l3.663-.293L7.308 2.212A.75.75 0 0 1 8 1.75Z" clipRule="evenodd" /></svg>
                <span>EOM: {monthNames[win.month - 1]} {win.year} <span className="font-normal opacity-80">(Avg. {win.score.toFixed(1)}%)</span></span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isEditMode ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <EditField label="Full Name" name="name" value={formData.name} onChange={handleChange} />
            <EditField label="Email" name="email" value={formData.email} onChange={handleChange} type="email" />
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
              <select name="gender" id="gender" value={formData.gender} onChange={handleChange} className="mt-1 w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <EditField label="Address" name="address" value={formData.address} onChange={handleChange} />
            <EditField label="City" name="city" value={formData.city} onChange={handleChange} />
            <EditField label="Country" name="country" value={formData.country} onChange={handleChange} />
            <EditField label="Qualification" name="qualification" value={formData.qualification} onChange={handleChange} />
            <div>
              <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700">Profile Picture</label>
              <input type="file" name="profilePicture" id="profilePicture" onChange={handleChange} className="mt-1 w-full text-sm border border-gray-300 rounded-lg p-2" />
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={handleSave} disabled={isUpdating} className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400">
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <InfoField label="Email" value={user.email} />
          <InfoField label="Gender" value={user.gender} />
          <InfoField label="Address" value={user.address} />
          <InfoField label="City" value={user.city} />
          <InfoField label="Country" value={user.country} />
          <InfoField label="Qualification" value={user.qualification} />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8 pt-8 border-t border-gray-200">
        <InfoField label="Department" value={user.department} />
        <InfoField label="Experience" value={user.experience} />
        <InfoField label="Work Type" value={user.workType} />
        <InfoField label="Company" value={user.company} />
        <InfoField label="Joining Date" value={user.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : 'N/A'} />
        <InfoField label="Work Location" value={user.workLocation} />
        <InfoField label="Shift" value={user.shift} />
      </div>
    </div>
  );
};

const EmployeeDashboard = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const [activeComponent, setActiveComponent] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [processPastDueTasks] = useProcessPastDueTasksMutation();

  useEffect(() => {
    // When the employee's dashboard loads, trigger the backend to process any past-due tasks.
    // This automatically moves tasks to 'Pending Verification' after their due date has passed.
    processPastDueTasks();
  }, [processPastDueTasks]);


  const { data: allEmployees = [] } = useGetEmployeesQuery();
  const pageTitles = {
    dashboard: 'Dashboard',
    'my-report': "Today's Report",
    'team-reports': 'Team Reports',
    'team-info': 'Team Information',
    analytics: 'Analytics',
    attendance: 'My Attendance',
    'my-tasks': 'My Tasks',
    'my-history': 'My Report History',
    'task-approvals': 'Task Approvals',
    'assign-task': 'Assign Task',
    'view-team-tasks': 'View Team Tasks',
    profile: 'My Profile',
  };
  const hasTeam = useMemo(() => {
    if (!user?.canViewTeam || !allEmployees.length) {
      return false;
    }
    // Check if anyone has this user as their teamLead
    return allEmployees.some(emp => emp.teamLead?._id === user._id);
  }, [user, allEmployees]);

  useEffect(() => {
    // If the active component is a team-only component and the user has no team,
    // default back to the dashboard.
    const teamComponents = ['team-reports', 'team-info', 'task-approvals', 'assign-task', 'view-team-tasks'];
    if (!hasTeam && teamComponents.includes(activeComponent)) {
      setActiveComponent('dashboard');
      setIsNotificationOpen(false);
    }
  }, [hasTeam, activeComponent]);

  const handleRefresh = () => {
    // Invalidate specific tags to refetch data without a full state reset
    dispatch(apiSlice.util.invalidateTags([
      'Task',
      'Notification',
      'Report',
      'Leave',
      'Holiday',
      'Announcement',
      'EOMHistory',
      'Employee'
    ]));
    toast.success("Dashboard data refreshed!");
  };

  const renderContent = () => {
    switch (activeComponent) {
      case 'dashboard':
        return <Dashboard user={user} onNavigate={setActiveComponent} />;
      case 'my-report':
        return <MyDailyReport employeeId={user._id} />;
      case 'team-reports':
        return hasTeam ? <TeamReports seniorId={user._id} /> : <Dashboard user={user} onNavigate={setActiveComponent} />;
      case 'my-history':
        return <MyReportHistory employeeId={user._id} />;
      case 'team-info':
        return user?.canViewTeam ? <TeamInformation seniorId={user._id} /> : <Dashboard user={user} onNavigate={setActiveComponent} />;
      case 'analytics':
        return <Analytics user={user} />;
      case 'profile':
        return <EmployeeProfile user={user} />;
      case 'attendance':
        return <MyAttendance employeeId={user._id} />;
      case 'my-tasks':
        return <MyTasks />;
      case 'task-approvals':
        return hasTeam && user?.canApproveTask ? <TaskApprovals /> : <Dashboard user={user} onNavigate={setActiveComponent} />;
      case 'assign-task':
        return hasTeam && user?.canAssignTask ? <AssignTask teamLeadId={user._id} /> : <Dashboard user={user} onNavigate={setActiveComponent} />;
      case 'view-team-tasks':
        return hasTeam ? <ViewTeamTasks teamLeadId={user._id} /> : <Dashboard user={user} onNavigate={setActiveComponent} />;
      default:
        return <Dashboard user={user} onNavigate={setActiveComponent} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 text-gray-800 font-manrope dark:bg-slate-900 dark:text-slate-200">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
          .font-manrope {
            font-family: 'Manrope', sans-serif;
          }
          .slider-thumb::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; background: #ffffff; border: 3px solid #3B82F6; border-radius: 50%; cursor: pointer; box-shadow: 0 0 5px rgba(0,0,0,0.1); }
          .slider-thumb::-moz-range-thumb { width: 20px; height: 20px; background: #ffffff; border: 3px solid #3B82F6; border-radius: 50%; cursor: pointer; box-shadow: 0 0 5px rgba(0,0,0,0.1); }
        `}
      </style>
      <aside className={`fixed z-50 top-0 left-0 h-full flex-shrink-0 border-r border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-lg flex flex-col transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
        <div className={`h-16 flex items-center border-b border-gray-200 dark:border-slate-700 flex-shrink-0 ${isSidebarCollapsed ? 'justify-center' : 'px-4 gap-3'}`}>
          <img src={user?.company === 'Volga Infosys' ? volgaInfosysLogo : starPublicityLogo} alt="Logo" className={`transition-all ${isSidebarCollapsed ? 'h-12 w-12' : 'h-10 w-auto'}`} />
          {!isSidebarCollapsed && (
            <span className="text-lg font-bold text-blue-800 dark:text-slate-200 truncate" title={user?.company}>
              {user?.company || 'Company Portal'}
            </span>
          )}
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button onClick={() => { setActiveComponent('dashboard'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${isSidebarCollapsed ? 'justify-center' : ''} ${activeComponent === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>
            <HomeIcon className="h-6 w-6" /> 
            {!isSidebarCollapsed && <span className="font-semibold">Dashboard</span>}
          </button>
          <button onClick={() => { setActiveComponent('my-report'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${isSidebarCollapsed ? 'justify-center' : ''} ${activeComponent === 'my-report' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>
            <DocumentTextIcon className="h-6 w-6" />
            {!isSidebarCollapsed && <span className="font-semibold">Today's Report</span>}
          </button>
          {hasTeam && (
            <button onClick={() => { setActiveComponent('team-reports'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${isSidebarCollapsed ? 'justify-center' : ''} ${activeComponent === 'team-reports' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
              <UserGroupIcon className="h-6 w-6" />
              {!isSidebarCollapsed && <span className="font-semibold">Team Reports</span>}
            </button>
          )}
          {hasTeam && (
            <button onClick={() => { setActiveComponent('team-info'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${isSidebarCollapsed ? 'justify-center' : ''} ${activeComponent === 'team-info' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
              <InformationCircleIcon className="h-6 w-6" />
              {!isSidebarCollapsed && <span className="font-semibold">Team Information</span>}
            </button>
          )}
          {(user?.role === 'Admin' || user?.canViewAnalytics) && (
            <button onClick={() => { setActiveComponent('analytics'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${isSidebarCollapsed ? 'justify-center' : ''} ${activeComponent === 'analytics' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
              <ChartBarIcon className="h-6 w-6" />
              {!isSidebarCollapsed && <span className="font-semibold">Analytics</span>}
            </button>
          )}
          <button onClick={() => { setActiveComponent('attendance'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${isSidebarCollapsed ? 'justify-center' : ''} ${activeComponent === 'attendance' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
            <CalendarDaysIcon className="h-6 w-6" />
            {!isSidebarCollapsed && <span className="font-semibold">My Attendance</span>}
          </button>
          <button onClick={() => { setActiveComponent('my-tasks'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${isSidebarCollapsed ? 'justify-center' : ''} ${activeComponent === 'my-tasks' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
            <ClipboardDocumentListIcon className="h-6 w-6" />
            {!isSidebarCollapsed && <span className="font-semibold">My Tasks</span>}
          </button>
          <button onClick={() => { setActiveComponent('my-history'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${isSidebarCollapsed ? 'justify-center' : ''} ${activeComponent === 'my-history' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
            <ArchiveBoxIcon className="h-6 w-6" />
            {!isSidebarCollapsed && <span className="font-semibold">My Report History</span>}
          </button>
          
          {hasTeam && (user?.role === 'Admin' || user?.canApproveTask) && (
          <button onClick={() => { setActiveComponent('task-approvals'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${isSidebarCollapsed ? 'justify-center' : ''} ${activeComponent === 'task-approvals' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
            <CheckBadgeIcon className="h-6 w-6" />
            {!isSidebarCollapsed && <span className="font-semibold">Task Approvals</span>}
          </button>
          )}
          {hasTeam && (user?.role === 'Admin' || user?.canAssignTask) && (
            <button onClick={() => { setActiveComponent('assign-task'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${isSidebarCollapsed ? 'justify-center' : ''} ${activeComponent === 'assign-task' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
              <ClipboardDocumentListIcon className="h-6 w-6" />
              {!isSidebarCollapsed && <span className="font-semibold">Assign Task</span>}
            </button>
          )}
          {hasTeam && (
            <button onClick={() => { setActiveComponent('view-team-tasks'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${isSidebarCollapsed ? 'justify-center' : ''} ${activeComponent === 'view-team-tasks' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
              <EyeIcon className="h-6 w-6" />
              {!isSidebarCollapsed && <span className="font-semibold">View Team Tasks</span>}
            </button>
          )}          </nav>
          <div className="p-4 mt-auto border-t border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-full flex items-center justify-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <ChevronDoubleLeftIcon className={`h-6 w-6 transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </aside> 
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-72'}`}>
          <AppHeader pageTitle={pageTitles[activeComponent]} onMenuClick={() => setSidebarOpen(true)} setActiveComponent={setActiveComponent} />
          <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900">
            {renderContent()}
          </main>
        </div>
    </div>
   );
};

export default EmployeeDashboard;
 