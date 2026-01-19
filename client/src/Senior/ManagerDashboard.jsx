import React, { useState, useEffect, useMemo } from 'react';
import {
  HomeIcon as HomeIconSolid,
  HomeIcon, UserGroupIcon, PencilSquareIcon, InformationCircleIcon, CalendarDaysIcon, ArchiveBoxIcon, ClipboardDocumentListIcon, CheckBadgeIcon, ChartBarIcon, CalendarIcon, ArrowLeftIcon, BuildingLibraryIcon, Bars3Icon, BellIcon, CheckCircleIcon
} from '@heroicons/react/24/outline';
import { DocumentTextIcon, UsersIcon, BriefcaseIcon, EyeIcon, ChevronDoubleLeftIcon } from '@heroicons/react/24/solid';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '../app/authSlice';
import { apiSlice } from '../services/apiSlice';
import { useGetEmployeesQuery, useProcessPastDueTasksMutation, useGetAllTasksQuery, useGetTasksForApprovalQuery, useGetActiveAnnouncementQuery } from '../services/EmployeApi';
import toast from 'react-hot-toast'; 
import AssignTask from './AssignTask.jsx';
import TaskApprovals from '../Admin/TaskApprovals';
import ThemeToggle from '../ThemeToggle.jsx';
import HolidayManagement from '../Admin/HolidayManagement.jsx';
import LeaveManagement from '../Admin/LeaveManagement.jsx';
import AnnouncementWidget from '../services/AnnouncementWidget.jsx';
import AttendanceCalendar from '../services/AttendanceCalendar.jsx';
import AllEmployeeAttendance from '../Admin/AllEmployeeAttendance.jsx';
import ViewTeamTasks from './ViewTeamTasks.jsx';
import { TeamReports } from '../Admin/AdminDashboard.jsx';
import { Dashboard as EmployeeDashboardHome, MyTasks, MyReportHistory, MyDailyReport, MyAttendance, EmployeeProfile as ManagerProfile, TeamInformation, StatCard, Analytics } from '../Employee/EmployeDashboard.jsx';
import starPublicityLogo from '../assets/starpublicity.png';
import volgaInfosysLogo from '../assets/volgainfosys.png';
import GooglePieChart from '../Admin/GooglePieChart.jsx';
import AppHeader from '../app/AppHeader.jsx';

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


const ManagerDashboardContent = ({ user, onNavigate }) => {
  const { data: allTasks = [], isLoading: isLoadingTasks } = useGetAllTasksQuery();
  const { data: allEmployees = [], isLoading: isLoadingEmployees } = useGetEmployeesQuery();
  const { data: tasksForApproval = [], isLoading: isLoadingApprovals } = useGetTasksForApprovalQuery(undefined, { pollingInterval: 30000 });
  const { data: announcement } = useGetActiveAnnouncementQuery();

  // Team member IDs (direct & indirect)
  const teamMemberIds = useMemo(() => {
    if (!allEmployees || !user?._id) return new Set();
    const getAllSubordinates = (managerId, employees) => {
      const subordinates = [];
      const queue = employees.filter(emp => emp.teamLead?._id === managerId);
      const visited = new Set(queue.map(e => e._id));
      while (queue.length > 0) {
        const currentEmployee = queue.shift();
        subordinates.push(currentEmployee);
        const directReports = employees.filter(emp => emp.teamLead?._id === currentEmployee._id);
        for (const report of directReports) {
          if (!visited.has(report._id)) {
            visited.add(report._id);
            queue.push(report);
          }
        }
      }
      return subordinates;
    };
    return new Set(getAllSubordinates(user._id, allEmployees).map(e => e._id));
  }, [allEmployees, user]);

  // Stats & next due dates
  const stats = useMemo(() => {
    const now = new Date();
    const todayUTCStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const teamTasks = allTasks.filter(task => teamMemberIds.has(task.assignedTo?._id));
    let teamUpcomingDueDate = null;
    let teamUpcomingTaskTitle = '';
    const taskStats = { completed: 0, inProgress: 0, pending: 0, pendingVerification: 0 };

    teamTasks.forEach(task => {
      if (['Pending', 'In Progress'].includes(task.status) && task.dueDate && new Date(task.dueDate) >= todayUTCStart) {
        const dueDate = new Date(task.dueDate);
        if (!teamUpcomingDueDate || dueDate < teamUpcomingDueDate) {
          teamUpcomingDueDate = dueDate;
          teamUpcomingTaskTitle = task.title;
        }
      }
      if (task.status === 'Completed') taskStats.completed++;
      else if (task.status === 'In Progress') taskStats.inProgress++;
      else if (task.status === 'Pending Verification') taskStats.pendingVerification++;
      else if (task.status === 'Pending') taskStats.pending++;
    });

    return {
      teamMemberCount: teamMemberIds.size,
      totalTeamTasks: teamTasks.length,
      pendingApprovalsCount: tasksForApproval.length,
      pendingApprovalTasks: tasksForApproval.slice(0, 5),
      teamUpcomingDueDate,
      teamUpcomingTaskTitle,
      taskStats,
    };
  }, [allTasks, teamMemberIds, tasksForApproval, user]);

  // Chart data
  const taskChartData = [
    { name: 'Completed', value: stats?.taskStats?.completed || 0 },
    { name: 'In Progress', value: stats?.taskStats?.inProgress || 0 },
    { name: 'Pending', value: stats?.taskStats?.pending || 0 },
    { name: 'Verification', value: stats?.taskStats?.pendingVerification || 0 },
  ].filter(entry => entry.value > 0);

  const TASK_COLORS = { 'Completed': '#10B981', 'In Progress': '#3B82F6', 'Pending': '#F59E0B', 'Verification': '#8B5CF6' };

  if (isLoadingTasks || isLoadingEmployees || isLoadingApprovals) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  // --- Redesigned Attractive Dashboard ---
  return (
    <div className="p-0 min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-slate-900 dark:via-slate-900 dark:to-black font-manrope relative overflow-hidden">
      <AnnouncementWidget />
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 text-white rounded-b-3xl shadow-xl mb-12 overflow-hidden p-8">
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg">Welcome, {user.name}!</h1>
            <p className="mt-3 text-lg text-blue-100/90 font-medium">Here’s a snapshot of your team’s progress.</p>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl text-center">
            <p className="text-sm font-semibold text-blue-200">Next Team Deadline</p>
            <p className="text-2xl font-bold text-yellow-300">{formatDueDate(stats.teamUpcomingDueDate)}</p>
            <p className="text-xs font-medium text-blue-200 truncate max-w-[200px]">{stats.teamUpcomingTaskTitle}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 -mt-20 z-20 relative">
        <div
          onClick={() => onNavigate && onNavigate('team-info')}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 flex flex-col items-center border-t-4 border-blue-500 hover:scale-105 transition-transform duration-300 cursor-pointer"
        >
          <UsersIcon className="h-10 w-10 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats?.teamMemberCount ?? 0}</p>
          <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">Team Members</p>
        </div>
        <div
          onClick={() => onNavigate && onNavigate('view-team-tasks')}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 flex flex-col items-center border-t-4 border-purple-500 hover:scale-105 transition-transform duration-300 cursor-pointer"
        >
          <BriefcaseIcon className="h-10 w-10 text-purple-500 mb-2" />
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{stats?.totalTeamTasks ?? 0}</p>
          <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">Team Tasks</p>
        </div>
        <div
          onClick={() => onNavigate('task-approvals')}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 flex flex-col items-center border-t-4 border-amber-500 hover:scale-105 transition-transform duration-300 cursor-pointer"
        >
          <CheckBadgeIcon className="h-10 w-10 text-amber-500 mb-2" />
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{stats?.pendingApprovalsCount ?? 0}</p>
          <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">Pending Approvals</p>
        </div>
        {announcement ? (
          <div className="bg-indigo-600 text-white rounded-2xl shadow-xl p-6 flex flex-col justify-between relative overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer col-span-2 lg:col-span-1" onClick={() => onNavigate('announcements')}>
            <MegaphoneIcon className="absolute -right-4 -bottom-4 h-28 w-28 text-white/10" />
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="animate-pulse-slow"><MegaphoneIcon className="h-6 w-6" /></div>
                <p className="text-xs font-semibold uppercase tracking-wider">Announcement</p>
              </div>
              <p className="text-lg font-bold mt-2 break-words">{announcement.title}</p>
              <p className="text-xs text-indigo-200 mt-1 break-words line-clamp-2">{announcement.content}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 flex flex-col items-center border-t-4 border-green-500 hover:scale-105 transition-transform duration-300 cursor-pointer" onClick={() => onNavigate('my-tasks')}>
            <CalendarIcon className="h-10 w-10 text-green-500 mb-2" />
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">{formatDueDate(stats.myUpcomingDueDate)}</p>
            <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">My Next Due Date</p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
        {/* Team Task Status Chart */}
        <div className="lg:col-span-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl border border-blue-100 dark:border-slate-700 shadow-2xl p-8 flex flex-col justify-center hover:shadow-3xl transition-shadow duration-300">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6">Team Task Status</h3>
          {taskChartData.length > 0 ? (
            <div className="w-full h-[400px]">
              <GooglePieChart data={taskChartData} title="" colors={TASK_COLORS} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500">No task data available for your team.</div>
          )}
        </div>
        {/* Pending Approvals */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl border border-amber-100 dark:border-slate-700 shadow-2xl p-8 flex flex-col hover:shadow-3xl transition-shadow duration-300">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6">Pending Your Approval</h3>
          <div className="space-y-4 flex-1 overflow-y-auto -mr-4 pr-4">
            {stats.pendingApprovalTasks.length > 0 ? (
              stats.pendingApprovalTasks.map(notification => (
                <div key={notification._id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer" onClick={() => onNavigate('task-approvals')}>
                  <p className="font-semibold text-base text-slate-800 dark:text-slate-200">{notification.relatedTask?.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Submitted by: {notification.subjectEmployee?.name}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400 dark:text-slate-500 h-full flex flex-col items-center justify-center">
                <CheckCircleIcon className="h-12 w-12 mx-auto text-green-400" />
                <p className="mt-2 font-semibold">All caught up!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ManagerDashboard = () => {

  const [activeView, setActiveView] = useState({ component: 'dashboard', props: {} });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarHovering, setIsSidebarHovering] = useState(false);

  const isSidebarExpanded = !isSidebarCollapsed || isSidebarHovering;

  const [processPastDueTasks] = useProcessPastDueTasksMutation();

  useEffect(() => {
    // When the manager's dashboard loads, trigger the backend to process any past-due tasks.
    // This automatically moves tasks to 'Pending Verification' after their due date has passed.
    processPastDueTasks();
  }, [processPastDueTasks]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useSelector(selectCurrentUser); 
  const { data: allEmployees = [] } = useGetEmployeesQuery();
  const isHrHead = user?.department === 'Human Resource' && user?.role === 'HR Head';
  const isHr = isHrHead || user?.role === 'HR Executive';
  const hasTeam = useMemo(() => {
    if (!user?.canViewTeam || !allEmployees.length) {
      return false;
    }
    // Check if anyone has this user as their teamLead
    return allEmployees.some(emp => emp.teamLead?._id === user._id);
  }, [user, allEmployees]);
  const dispatch = useDispatch();

  const handleRefresh = () => {
    // Invalidate specific tags to refetch data without a full state reset
    dispatch(apiSlice.util.invalidateTags([
      'Employee',
      'Task',
      'Notification',
      'Report',
      'Leave',
      'Holiday',
      'Announcement',
      'EOMHistory'
    ]));
    toast.success("Dashboard data refreshed!");
  };

  const navItems = useMemo(() => {
    const items = [
      { id: 'dashboard', icon: HomeIcon, label: 'Dashboard' },
    ];
    if (user?.canViewTeam) {
      items.push({ id: 'team-reports', icon: UserGroupIcon, label: 'Team Reports' });
      items.push({ id: 'team-info', icon: InformationCircleIcon, label: 'Team Information' });
    }
    items.push({ id: 'my-report', icon: PencilSquareIcon, label: 'My Daily Report' });
    items.push({ id: 'my-history', icon: ArchiveBoxIcon, label: 'My Report History' });
    items.push({ id: 'attendance', icon: CalendarDaysIcon, label: 'My Attendance' });
    items.push({ id: 'my-tasks', icon: ClipboardDocumentListIcon, label: 'My Tasks' });
    if (user?.role === 'Admin' || user?.canViewAnalytics) {
      items.push({ id: 'analytics', icon: ChartBarIcon, label: 'Analytics' });
    }
    if (user?.role === 'Admin' || user?.canApproveTask) {
      items.push({ id: 'task-approvals', icon: CheckBadgeIcon, label: 'Task Approvals' });
    }
    if (user?.role === 'Admin' || user?.canAssignTask) {
      items.push({ id: 'assign-task', icon: ClipboardDocumentListIcon, label: 'Assign Task' });
    }
    if (user?.role === 'Admin' || user?.canViewTeam) {
      items.push({ id: 'view-team-tasks', icon: EyeIcon, label: 'View Team Tasks' });
    }
    if (isHr) {
      items.push({ id: 'holidays', icon: BuildingLibraryIcon, label: 'Holiday Management' });
    }
    if (isHr) {
      items.push({ id: 'leave-management', icon: CalendarIcon, label: 'Leave Management' });
    }
    if (isHr) {
      items.push({ id: 'all-attendance', icon: CalendarDaysIcon, label: 'All Attendance' });
    }
    return items; 
  }, [user, isHrHead, hasTeam]);

  const handleNavigation = (view) => {
    if (typeof view === 'string') {
      setActiveView({ component: view, props: {} });
    } else {
      setActiveView(view);
    }
  };

  useEffect(() => {
    // If the active component is a team-only component and the user has no team,
    // default back to the dashboard.
    const teamComponents = ['team-reports', 'team-info', 'task-approvals', 'assign-task', 'view-team-tasks'];
    if (!hasTeam && teamComponents.includes(activeView.component)) {
      setActiveView({ component: 'dashboard', props: {} });
      setIsNotificationOpen(false);
    }
  }, [hasTeam, activeView.component]);

    const renderActiveComponent = () => {
      switch (activeView.component) {
        case 'dashboard': return <ManagerDashboardContent user={user} onNavigate={handleNavigation} />; // This is the manager-specific one
        case 'team-reports': return user?.canViewTeam ? <TeamReports /> : <EmployeeDashboardHome user={user} onNavigate={handleNavigation} />;
        case 'team-info': return user?.canViewTeam ? <TeamInformation seniorId={user?._id} /> : <EmployeeDashboardHome user={user} onNavigate={handleNavigation} />;
        case 'my-report': return <MyDailyReport employeeId={user?._id} />;
        case 'my-history': return <MyReportHistory employeeId={user?._id} />;
        case 'profile': return <ManagerProfile user={user} />;
        case 'attendance': return <MyAttendance employeeId={user._id} />;
        case 'my-tasks': return <MyTasks />;
        case 'analytics': return <Analytics user={user} />;
        case 'task-approvals': return user?.canViewTeam ? <TaskApprovals /> : <EmployeeDashboardHome user={user} onNavigate={handleNavigation} />;
        case 'assign-task': return user?.canViewTeam ? <AssignTask teamLeadId={user._id} /> : <EmployeeDashboardHome user={user} onNavigate={handleNavigation} />;
        case 'view-team-tasks': return user?.canViewTeam ? <ViewTeamTasks teamLeadId={user._id} {...activeView.props} /> : <EmployeeDashboardHome user={user} onNavigate={handleNavigation} />;
        case 'holidays': return isHr ? <HolidayManagement /> : <ManagerDashboardContent user={user} onNavigate={handleNavigation} />;
        case 'leave-management': return isHr ? <LeaveManagement /> : <ManagerDashboardContent user={user} onNavigate={handleNavigation} />;
        case 'all-attendance': return isHr ? <AllEmployeeAttendance /> : <ManagerDashboardContent user={user} onNavigate={handleNavigation} />;
        default: return <ManagerDashboardContent user={user} onNavigate={handleNavigation} />;
      }
    };

    return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900 font-manrope">
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
            .font-manrope {
              font-family: 'Manrope', sans-serif;
            }
          `}
        </style>
        <div 
        className={`fixed top-0 z-50 h-screen flex-shrink-0 transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${isSidebarExpanded ? 'w-64' : 'w-24'}`}
        onMouseEnter={() => isSidebarCollapsed && setIsSidebarHovering(true)}
          onMouseLeave={() => isSidebarCollapsed && setIsSidebarHovering(false)}
        >
          {/* Sidebar */}
          <aside className="w-full h-full bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 flex flex-col border-r border-gray-200 dark:border-slate-700 shadow-lg">
            <div className={`h-16 flex items-center border-b border-gray-200 dark:border-slate-700 flex-shrink-0 ${isSidebarExpanded ? 'px-4 gap-3' : 'justify-center'}`}>
            {user?.company === 'Volga Infosys' ? (
              <img src={volgaInfosysLogo} alt="Logo" className={`transition-all ${isSidebarExpanded ? 'h-10 w-auto' : 'h-12 w-12'}`} />
            ) : (
              <img src={starPublicityLogo} alt="Logo" className={`transition-all ${isSidebarExpanded ? 'h-10 w-auto' : 'h-12 w-12'}`} />
            )}
            {isSidebarExpanded && (
              <span className="text-lg font-bold text-gray-800 dark:text-slate-200 tracking-tight">{user?.company || 'Company Portal'}</span>
            )}
          </div><nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { handleNavigation(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-200 text-left relative ${!isSidebarExpanded && 'justify-center'} ${ 
                  activeView.component === item.id ? 'bg-blue-600 text-white shadow' : 'text-gray-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700' 
                }`}
              >
                <item.icon className="h-6 w-6" />
                {isSidebarExpanded && <span className="font-semibold text-sm">{item.label}</span>}
                {activeView.component === item.id && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-blue-500 rounded-r-lg"></span>
                )}
              </button>
            ))}
          </nav>
          <div className="p-4 mt-auto border-t border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-full flex items-center justify-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <ChevronDoubleLeftIcon className={`h-6 w-6 transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>            </aside>
        </div>
        {/* Overlay for mobile sidebar */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>}
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarExpanded ? 'md:ml-64' : 'md:ml-24'}`}>
          <AppHeader pageTitle={navItems.find(i => i.id === activeView.component)?.label} onMenuClick={() => setSidebarOpen(true)} setActiveComponent={handleNavigation} />
          <main className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-900">{renderActiveComponent()}</main>
        </div>
      </div>
    );
  }

export default ManagerDashboard;
