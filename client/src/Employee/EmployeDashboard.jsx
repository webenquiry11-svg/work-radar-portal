import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useGetTodaysReportQuery, useUpdateTodaysReportMutation, useGetEmployeesQuery, useGetReportsByEmployeeQuery, useUpdateEmployeeMutation, useGetHolidaysQuery, useGetLeavesQuery, useGetMyTasksQuery, useUpdateTaskMutation, useGetNotificationsQuery, useMarkNotificationsAsReadMutation, useGetAllTasksQuery, useAddTaskCommentMutation } from '../services/EmployeApi';
import { useLogoutMutation } from '../services/apiSlice';
import { apiSlice } from '../services/apiSlice';
import toast from 'react-hot-toast';
import { ArrowPathIcon, ArrowRightOnRectangleIcon, PaperAirplaneIcon, BookmarkIcon, PlusIcon, TrashIcon, DocumentTextIcon, UserCircleIcon, BriefcaseIcon, CheckCircleIcon, HomeIcon, ChartBarIcon, ChevronDownIcon, UserGroupIcon, InformationCircleIcon, CakeIcon, CalendarDaysIcon, ClipboardDocumentListIcon, CheckBadgeIcon, BellIcon, ArchiveBoxIcon, TrophyIcon, StarIcon, ShieldCheckIcon, ExclamationTriangleIcon, ClockIcon, CalendarIcon, ChatBubbleLeftEllipsisIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { EyeIcon, XMarkIcon, CalendarDaysIcon as CalendarOutlineIcon, InformationCircleIcon as InfoOutlineIcon } from '@heroicons/react/24/solid';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, setCredentials } from '../app/authSlice';
import PastReportsList from './PastReports';
import CurrentUserProvider from '../app/CurrentUserProvider.jsx';
import AttendanceCalendar from '../services/AttendanceCalendar';
import TaskApprovals from '../Admin/TaskApprovals.jsx';
import AssignTask from './AssignTask.jsx';
import ViewTeamTasks from './ViewTeamTasks.jsx';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const TaskDetailsModal = ({ isOpen, onClose, task, taskNumber }) => {
  const [comment, setComment] = useState('');
  const [addComment, { isLoading: isAddingComment }] = useAddTaskCommentMutation();
  if (!isOpen || !task) return null;

  const InfoField = ({ label, value, icon: Icon }) => (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 text-slate-400 mt-0.5" />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-800">{value || 'N/A'}</p>
      </div>
    </div>
  );

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    try {
      await addComment({ taskId: task._id, text: comment }).unwrap();
      setComment('');
      toast.success('Comment added!');
    } catch (err) {
      toast.error('Failed to add comment.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-auto max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Task Details</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <h4 className="font-bold text-xl text-blue-700">
                {task.title} 
                {taskNumber && <span className="ml-2 text-sm font-medium text-slate-400">(Task {taskNumber})</span>}
              </h4>
              <p className="text-sm text-slate-600">{task.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                <InfoField label="Priority" value={task.priority} icon={InfoOutlineIcon} />
                <InfoField label="Status" value={task.status} icon={CheckCircleIcon} />
                <InfoField label="Start Date" value={task.startDate ? new Date(task.startDate).toLocaleDateString() : 'N/A'} icon={CalendarOutlineIcon} />
                <InfoField label="Due Date" value={task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'} icon={CalendarOutlineIcon} />
              </div>
            </div>
            <div className="md:col-span-1 bg-slate-50 p-4 rounded-lg border flex flex-col h-full">
              <h5 className="font-semibold text-slate-700 mb-3 flex items-center gap-2 flex-shrink-0"><ChatBubbleLeftEllipsisIcon className="h-5 w-5" /> Comments</h5>
              <div className="flex-1 space-y-5 overflow-y-auto mb-4 pr-2 -mr-2 relative">
                {task.comments?.map(c => (
                  <div key={c._id} className="relative flex items-start gap-4">
                    <div className="absolute top-0 left-4 h-full w-px bg-slate-200"></div>
                    <img src={c.author.profilePicture || `https://ui-avatars.com/api/?name=${c.author.name}`} alt={c.author.name} className="relative z-10 h-8 w-8 rounded-full flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-sm font-semibold text-slate-900">{c.author.name}</span>
                        <span className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-sm text-slate-700 mt-0.5">{c.text}</p>
                    </div>
                  </div>
                ))}
                {task.comments?.length === 0 && <p className="text-xs text-slate-400 text-center">No comments yet.</p>}
              </div>
              <div className="flex gap-2 flex-shrink-0 mt-auto pt-2 border-t border-slate-200">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full text-xs border-slate-300 rounded-lg p-2"
                />
                <button onClick={handleAddComment} disabled={isAddingComment} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                  <PaperAirplaneIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 bg-slate-50 rounded-b-lg flex justify-end">
          <button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm">Close</button>
        </div>
      </div>
    </div>
  );
};


const EmployeeProfile = ({ user }) => {
  const dispatch = useDispatch();
  const [isEditMode, setIsEditMode] = useState(false);
  const [updateProfile, { isLoading: isUpdating }] = useUpdateEmployeeMutation();
  const token = useSelector(state => state.auth.token);
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
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200 shadow-xl p-8">
      <div className="flex justify-between items-start mb-8 pb-8 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8">
        <img
          src={user.profilePicture || `https://i.pravatar.cc/150?u=${user.email}`}
          alt="Profile"
          className="h-32 w-32 rounded-full object-cover border-4 border-blue-200 shadow-lg"
        />
        <div>
          <h2 className="text-3xl font-bold text-blue-800">{user.name}</h2>
          <p className="text-gray-600">{user.role}</p>
          <p className="text-sm text-gray-500 font-mono mt-1">{user.employeeId}</p>
        </div>
      </div>
        {user.canEditProfile && (
          <button onClick={() => setIsEditMode(!isEditMode)} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors">
            {isEditMode ? 'Cancel' : 'Edit Profile'}
          </button>
        )}
      </div>

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

const Dashboard = ({ user, onNavigate }) => {
  const { data: tasks = [], isLoading } = useGetMyTasksQuery();
  const { data: allTasks = [] } = useGetAllTasksQuery();
  const { data: allEmployees = [] } = useGetEmployeesQuery();

  // Find next due date for user's own tasks
  const nextMyTaskDueDate = useMemo(() => {
    const upcoming = tasks
      .filter(task => task.dueDate && (task.status === 'Pending' || task.status === 'In Progress'))
      .map(task => new Date(task.dueDate))
      .filter(date => date >= new Date())
      .sort((a, b) => a - b);
    return upcoming.length > 0 ? upcoming[0] : null;
  }, [tasks]);

  // Find next due date for team tasks assigned by this user (if they are a team lead)
  const nextTeamTaskDueDate = useMemo(() => {
    if (!user?.canAssignTask) return null;
    const teamMemberIds = allEmployees
      .filter(emp => emp.teamLead?._id === user._id)
      .map(emp => emp._id);
    const teamTasks = allTasks
      .filter(task =>
        teamMemberIds.includes(task.assignedTo?._id) &&
        task.dueDate &&
        (task.status === 'Pending' || task.status === 'In Progress')
      )
      .map(task => new Date(task.dueDate))
      .filter(date => date >= new Date())
      .sort((a, b) => a - b);
    return teamTasks.length > 0 ? teamTasks[0] : null;
  }, [allTasks, allEmployees, user]);

  const stats = useMemo(() => {
    const taskStats = { pending: 0, inProgress: 0 };
    const gradeStats = { Completed: 0, Moderate: 0, Low: 0, Pending: 0 };
    const recentTasks = [];

    tasks.forEach(task => {
      if (task.status === 'Pending' || task.status === 'In Progress') {
        if (task.status === 'Pending') taskStats.pending++;
        if (task.status === 'In Progress') taskStats.inProgress++;
        recentTasks.push(task);
      } else if (task.status === 'Completed') {
        if (gradeStats.hasOwnProperty(task.completionCategory)) {
          gradeStats[task.completionCategory]++;
        }
      }
    });

    // Sort recent tasks by creation date and take the top 5
    const sortedRecentTasks = recentTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    return { taskStats, gradeStats, recentTasks: sortedRecentTasks };
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
    <div className="p-0 sm:p-0 lg:p-0 min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 font-manrope">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 text-white rounded-b-3xl shadow-xl mb-12 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 px-8 py-12 flex flex-col md:flex-row items-center md:items-end justify-between gap-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg">Welcome, {user.name}!</h1>
            <p className="mt-3 text-lg text-blue-100/90 font-medium">Here’s your daily snapshot. Stay productive and keep growing!</p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <ClockIcon className="h-7 w-7 text-white/80" />
              <span className="font-semibold text-lg">
                Next Task Due: <span className="text-yellow-200">{formatDueDate(nextMyTaskDueDate)}</span>
              </span>
            </div>
            {user?.canAssignTask && nextTeamTaskDueDate && (
              <div className="flex items-center gap-3">
                <UserGroupIcon className="h-7 w-7 text-white/80" />
                <span className="font-semibold text-lg">
                  Next Team Task Due: <span className="text-green-200">{formatDueDate(nextTeamTaskDueDate)}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 -mt-20 z-20 relative">
        <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center border-t-4 border-blue-500 hover:scale-105 transition-transform duration-200">
          <ClipboardDocumentListIcon className="h-10 w-10 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-blue-700">{stats.taskStats.pending + stats.taskStats.inProgress}</p>
          <p className="text-sm font-semibold text-gray-500">Active Tasks</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center border-t-4 border-emerald-500 hover:scale-105 transition-transform duration-200">
          <TrophyIcon className="h-10 w-10 text-emerald-500 mb-2" />
          <p className="text-2xl font-bold text-emerald-700">{stats.gradeStats.Completed}</p>
          <p className="text-sm font-semibold text-gray-500">Completed</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center border-t-4 border-blue-500 hover:scale-105 transition-transform duration-200">
          <ShieldCheckIcon className="h-10 w-10 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-blue-700">{stats.gradeStats.Moderate}</p>
          <p className="text-sm font-semibold text-gray-500">Moderate</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center border-t-4 border-amber-500 hover:scale-105 transition-transform duration-200">
          <StarIcon className="h-10 w-10 text-amber-500 mb-2" />
          <p className="text-2xl font-bold text-amber-700">{stats.gradeStats.Low}</p>
          <p className="text-sm font-semibold text-gray-500">Low</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 mt-16 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Quick Actions & Performance */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button onClick={() => onNavigate('my-report')} className="w-full flex items-center gap-3 text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg font-semibold text-blue-700 transition-colors">
                <DocumentTextIcon className="h-6 w-6" />
                <span>Go to Today's Report</span>
              </button>
              <button onClick={() => onNavigate('my-tasks')} className="w-full flex items-center gap-3 text-left p-4 bg-slate-50 hover:bg-slate-100 rounded-lg font-semibold text-slate-700 transition-colors">
                <ClipboardDocumentListIcon className="h-6 w-6" />
                <span>View All My Tasks</span>
              </button>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Performance Snapshot</h3>
            <div className="grid grid-cols-2 gap-4">
              <GradeCard label="Completed" value={stats.gradeStats.Completed} icon={TrophyIcon} colorClass="bg-emerald-500" />
              <GradeCard label="Moderate" value={stats.gradeStats.Moderate} icon={ShieldCheckIcon} colorClass="bg-blue-500" />
              <GradeCard label="Low" value={stats.gradeStats.Low} icon={StarIcon} colorClass="bg-amber-500" />
              <GradeCard label="Pending" value={stats.gradeStats.Pending} icon={ExclamationTriangleIcon} colorClass="bg-red-500" />
            </div>
          </div>
        </div>
        {/* Recent Tasks */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Your Active Tasks</h3>
          <div className="space-y-4"> 
            {stats.recentTasks.length > 0 ? (
              stats.recentTasks.map((task, index) => (
                <div key={task._id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-slate-800">
                      Task {index + 1}: {task.title}
                    </p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
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

const Analytics = ({ user }) => {
  const [view, setView] = useState('my_stats'); // 'my_stats' or 'team_stats'
  const { data: allTasks = [], isLoading: isLoadingAllTasks } = useGetAllTasksQuery();
  const { data: allEmployees = [], isLoading: isLoadingEmployees } = useGetEmployeesQuery();

  const teamMemberIds = useMemo(() => {
    if (!allEmployees || !user?._id) return new Set();
    const subordinates = [];
    const queue = allEmployees.filter(emp => emp.teamLead?._id === user._id);
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
  }, [allEmployees, user]);

  const { gradeStats, title } = useMemo(() => {
    const stats = { Completed: 0, Moderate: 0, Low: 0, Pending: 0 };
    let relevantTasks = [];
    let viewTitle = '';

    if (view === 'my_stats') {
      relevantTasks = allTasks.filter(task => task.assignedTo?._id === user._id);
      viewTitle = "My Performance Analytics";
    } else if (view === 'team_stats') {
      relevantTasks = allTasks.filter(task => teamMemberIds.has(task.assignedTo?._id));
      viewTitle = "Team Performance Analytics";
    }

    relevantTasks.forEach(task => {
      if (task.status === 'Completed' && stats.hasOwnProperty(task.completionCategory)) {
        stats[task.completionCategory]++;
      }
    });

    return { gradeStats: stats, title: viewTitle };
  }, [allTasks, user, view, teamMemberIds]);

  const chartData = Object.entries(gradeStats).map(([name, value]) => ({ name, value })).filter(item => item.value > 0);

  const GRADE_COLORS = { Completed: '#10B981', Moderate: '#3B82F6', Low: '#F59E0B', Pending: '#EF4444' };
  const GRADE_ICONS = { Completed: TrophyIcon, Moderate: ShieldCheckIcon, Low: StarIcon, Pending: ExclamationTriangleIcon };

  const StatCard = ({ grade, count }) => {
    const Icon = GRADE_ICONS[grade];
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

  if (isLoadingAllTasks || isLoadingEmployees) {
    return <div className="p-8 text-center">Loading analytics...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{title}</h1>
          <p className="text-slate-500 mt-2">A breakdown of completed tasks by final grade.</p>
        </div>
        {user?.canViewTeam && teamMemberIds.size > 0 && (
          <div className="flex items-center bg-slate-200 rounded-lg p-1">
            <button onClick={() => setView('my_stats')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${view === 'my_stats' ? 'bg-white text-blue-600 shadow' : 'text-slate-600'}`}>My Stats</button>
            <button onClick={() => setView('team_stats')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${view === 'team_stats' ? 'bg-white text-blue-600 shadow' : 'text-slate-600'}`}>Team Stats</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Object.entries(gradeStats).map(([grade, count]) => (
          <StatCard key={grade} grade={grade} count={count} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-lg p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Grade Distribution</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GRADE_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">No graded tasks to display for this view.</div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">How Grades Are Calculated</h3>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex gap-3"><strong className="font-semibold text-emerald-600 w-20">Completed:</strong><span>Task progress was 100% upon approval.</span></li>
            <li className="flex gap-3"><strong className="font-semibold text-blue-600 w-20">Moderate:</strong><span>Task progress was 80% - 99% upon approval.</span></li>
            <li className="flex gap-3"><strong className="font-semibold text-amber-600 w-20">Low:</strong><span>Task progress was 60% - 79% upon approval.</span></li>
            <li className="flex gap-3"><strong className="font-semibold text-red-600 w-20">Pending:</strong><span>Task progress was below 60% upon approval.</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const MyTasks = () => {
  const { data: tasks = [], isLoading } = useGetMyTasksQuery();
  const [viewingTask, setViewingTask] = useState(null);
  const [viewingTaskNumber, setViewingTaskNumber] = useState(null);
  const { data: allTasks = [] } = useGetAllTasksQuery();
  const { data: allEmployees = [] } = useGetEmployeesQuery();
  const user = useSelector(selectCurrentUser);

  // Find next due date for user's own tasks
  const nextMyTaskDueDate = useMemo(() => {
    const upcoming = tasks
      .filter(task => task.dueDate && (task.status === 'Pending' || task.status === 'In Progress'))
      .map(task => new Date(task.dueDate))
      .filter(date => date >= new Date())
      .sort((a, b) => a - b);
    return upcoming.length > 0 ? upcoming[0] : null;
  }, [tasks]);

  // Find next due date for team tasks assigned by this user (if they have assigned any)
  const nextTeamTaskDueDate = useMemo(() => {
    if (!user?.canAssignTask) return null;
    // Find all tasks assigned by this user to their team
    const teamMemberIds = allEmployees
      .filter(emp => emp.teamLead?._id === user._id)
      .map(emp => emp._id);
    const teamTasks = allTasks
      .filter(task =>
        task.assignedBy?._id === user._id &&
        teamMemberIds.includes(task.assignedTo?._id) &&
        task.dueDate &&
        (task.status === 'Pending' || task.status === 'In Progress')
      )
      .map(task => new Date(task.dueDate))
      .filter(date => date >= new Date())
      .sort((a, b) => a - b);
    return teamTasks.length > 0 ? teamTasks[0] : null;
  }, [allTasks, allEmployees, user]);

  const priorityStyles = {
    High: 'bg-red-100 text-red-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    Low: 'bg-green-100 text-green-800',
  };

  const statusColors = {
    'Pending': 'bg-slate-100 text-slate-800',
    'In Progress': 'bg-blue-100 text-blue-800',
  };
  if (isLoading) {
    return <div className="p-8 text-center">Loading tasks...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Tasks</h1>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {nextMyTaskDueDate && (
          <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg shadow font-semibold text-sm flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-blue-500" />
            Next Task Due: {nextMyTaskDueDate.toLocaleDateString()}
          </div>
        )}
        {user?.canViewTeam && nextTeamTaskDueDate && (
          <div className="bg-indigo-50 text-indigo-800 px-4 py-2 rounded-lg shadow font-semibold text-sm flex items-center gap-2">
            <UserGroupIcon className="h-5 w-5 text-indigo-500" />
            Next Team Task Due: {nextTeamTaskDueDate.toLocaleDateString()}
          </div>
        )}
      </div>
      <div className="space-y-4">
        {tasks.length > 0 ? tasks.map((task, index) => (
          <div key={task._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-5">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">
                  Task {index + 1}: {task.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${priorityStyles[task.priority]}`}>{task.priority}</span>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusColors[task.status] || 'bg-gray-100'}`}>{task.status}</span>
                </div>
              </div>
              <div>
                <button onClick={() => { setViewingTask(task); setViewingTaskNumber(index + 1); }} className="text-xs font-semibold text-blue-600 hover:text-blue-700">View Details</button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{task.description}</p>
            <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
              <span>Assigned by: <span className="font-medium text-slate-700">{task.assignedBy.name}</span></span>
              {task.dueDate && <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
            </div>
            {task.rejectionReason && (
              <div className="mt-3 p-2 bg-red-50 border-l-4 border-red-400 text-red-700 text-xs">
                <p><strong className="font-semibold">Rejection Feedback:</strong> {task.rejectionReason}</p>
              </div>
            )}
          </div>
        )) : (
          <div className="text-center py-10 text-gray-500">
            <ClipboardDocumentListIcon className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-2 font-semibold">No tasks assigned to you.</p>
          </div>
        )}
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

const MyReportHistory = ({ employeeId }) => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [viewingTaskNumber, setViewingTaskNumber] = useState(null);

  const renderReportContent = (content) => {
    try {
      const data = JSON.parse(content);
      if (data.taskUpdates) { // Handle new progress-based reports
        return (
          <div className="space-y-4 text-sm">
            <strong className="font-semibold text-gray-600">Task Progress Updates:</strong>
            <div className="space-y-2 mt-2">
              {data.taskUpdates.map((update, i) => (
                <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex justify-between items-center">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">
                      Task {i + 1}: {update.taskId?.title || 'Unknown Task'}
                    </p>
                    <p>Progress Submitted: <span className="font-bold text-blue-600">{update.completion}%</span></p>
                  </div>
                  {update.taskId && (
                    <button onClick={() => {
                      setViewingTask(update.taskId);
                      setViewingTaskNumber(i + 1);
                    }} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Details</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }
      return <p className="whitespace-pre-wrap">{content}</p>;
    } catch (e) {
      return <p className="whitespace-pre-wrap">{content}</p>;
    }
  };

  return (
    <div className="flex h-full bg-slate-100">
      <aside className="w-72 flex-shrink-0 border-r border-gray-200 bg-gray-100">
        <PastReportsList employeeId={employeeId} onSelectReport={setSelectedReport} activeReportId={selectedReport?._id} />
      </aside>
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {selectedReport ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">{new Date(selectedReport.reportDate).toLocaleDateString('en-US', { dateStyle: 'full' })}</h3>
            {renderReportContent(selectedReport.content)}
          </div>
        ) : <div className="flex items-center justify-center h-full text-gray-500">Select a report from the history to view its details.</div>}
      </main>
      <TaskDetailsModal isOpen={!!viewingTask} onClose={() => setViewingTask(null)} task={viewingTask} taskNumber={viewingTaskNumber} />
    </div>
  );
};

const TeamInformation = ({ seniorId }) => {
  const { data: allEmployees, isLoading: isLoadingEmployees } = useGetEmployeesQuery();
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const teamMembers = useMemo(() => {
    if (!allEmployees || !seniorId) return [];

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

    return getAllSubordinates(seniorId, allEmployees);
  }, [allEmployees, seniorId]);

  if (isLoadingEmployees) {
    return <div className="p-8 text-center">Loading team information...</div>;
  }

  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Team Information</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map(employee => (
          <div key={employee._id} onClick={() => handleSelectEmployee(employee)} className={`bg-white rounded-xl shadow-lg border p-5 transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer ${selectedEmployee?._id === employee._id ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'}`}>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <img
                  src={employee.profilePicture || `https://ui-avatars.com/api/?name=${employee.name}&background=random`}
                  alt={employee.name}
                  className="h-16 w-16 rounded-full object-cover border-2 border-blue-200"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-gray-900 truncate">{employee.name}</h3>
                <p className="text-sm text-gray-500 truncate">{employee.role}</p>
                <p className="text-xs text-gray-400 font-mono truncate">{employee.employeeId}</p>
              </div>
            </div>
          </div>
        ))}
        {teamMembers.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-500">
            You do not have any team members assigned to you.
          </div>
        )}
      </div>
      {selectedEmployee && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Attendance for {selectedEmployee.name}
          </h2>
          <AttendanceCalendar employeeId={selectedEmployee._id} />
        </div>
      )}
    </div>
  );
};

const TeamReports = ({ seniorId }) => {
  const { data: allEmployees, isLoading: isLoadingEmployees, isError: isErrorEmployees } = useGetEmployeesQuery();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);

  const teamMembers = useMemo(() => {
    if (!allEmployees || !seniorId) return [];

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

    return getAllSubordinates(seniorId, allEmployees);
  }, [allEmployees, seniorId]);

  useEffect(() => {
    if (teamMembers.length > 0 && !selectedEmployee) {
      setSelectedEmployee(teamMembers[0]);
    }
  }, [teamMembers, selectedEmployee]);

  const { data: reports, isLoading: isLoadingReports } = useGetReportsByEmployeeQuery(selectedEmployee?._id, {
    skip: !selectedEmployee,
  });

  const renderReportContent = (content) => {
    try {
      const data = JSON.parse(content);
      // Handle new progress-based reports
      if (data.taskUpdates) {
        return (
          <div className="space-y-3">
            {data.taskUpdates.map((update, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-slate-800">{update.taskId?.title || 'Unknown Task'}</p>
                  <p className="text-sm text-slate-600">Progress Submitted: <span className="font-bold text-blue-600">{update.completion}%</span></p>
                </div>
                {update.taskId && (
                  <button onClick={() => setViewingTask(update.taskId)} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Details</button>
                )}
              </div>
            ))}
          </div>
        );
      }
      // Fallback for any old report format
      return (
        <div className="space-y-6 text-sm">
          <p className="whitespace-pre-line break-words">{JSON.stringify(data, null, 2)}</p>
        </div>
      );
    } catch (e) {
      return <p className="whitespace-pre-line break-words">{content}</p>;
    }
  };

  return (
    <div className="flex h-full bg-slate-100">
      <div className="w-full md:w-1/3 max-w-sm bg-white border-r border-gray-200 overflow-y-auto">
        <h2 className="text-lg font-semibold p-4 border-b text-gray-800">Your Team</h2>
        {isLoadingEmployees && <p className="p-4 text-gray-500">Loading...</p>}
        {isErrorEmployees && <p className="p-4 text-red-500">Failed to load team.</p>}
        <ul className="p-2">
          {teamMembers.map(employee => (
            <li key={employee._id}>
              <button onClick={() => setSelectedEmployee(employee)} className={`w-full text-left p-3 my-1 rounded-lg transition-colors duration-200 flex flex-col ${selectedEmployee?._id === employee._id ? 'bg-blue-100' : 'hover:bg-gray-50'}`} >
                <div className="flex justify-between items-center">
                  <p className={`font-semibold ${selectedEmployee?._id === employee._id ? 'text-blue-800' : 'text-gray-800'}`}>{employee.name}</p>
                  <p className="text-xs text-gray-500">{employee.employeeId}</p>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                  <span>Reports to: <span className="font-medium text-gray-600">{employee.teamLead?.name || 'N/A'}</span></span>
                  <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{employee.department || 'N/A'}</span>
                </div>
              </button>
            </li>
          ))}
          {teamMembers.length === 0 && !isLoadingEmployees && <p className="p-4 text-gray-500">No team members assigned to you.</p>}
        </ul>
      </div>
      <div className="flex-1 p-2 sm:p-6 overflow-y-auto">
        {selectedEmployee ? (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Reports for {selectedEmployee.name}</h2>
            {isLoadingReports && <p>Loading reports...</p>}
            <div className="space-y-6">
              {reports?.map(report => (
                <div key={report._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 flex justify-between">{new Date(report.reportDate).toLocaleDateString('en-US', { dateStyle: 'full' })}<span className={`font-normal text-sm px-2.5 py-0.5 rounded-full ${report.status === 'Submitted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{report.status}</span></h3>
                  {renderReportContent(report.content)}
                </div>
              ))}
              {reports?.length === 0 && <p className="text-gray-500">No reports found for this employee.</p>}
            </div>
          </div>
        ) : <div className="flex items-center justify-center h-full text-gray-500">Select a team member to view their reports.</div>}
      </div>
      <TaskDetailsModal
        isOpen={!!viewingTask}
        onClose={() => setViewingTask(null)}
        task={viewingTask}
      />
    </div>
  );
};

const MyDailyReport = ({ employeeId }) => {
  const { data: assignedTasks = [], isLoading: isLoadingTasks } = useGetMyTasksQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: todaysReport, isLoading: isLoadingReport } = useGetTodaysReportQuery(employeeId);
  const [updateTodaysReport, { isLoading: isUpdating }] = useUpdateTodaysReportMutation();
  const [progress, setProgress] = useState({});

  const isReadOnly = useMemo(() => {
    const now = new Date();
    // Check if it's past 7 PM (19:00)
    const isPastCutoff = now.getHours() >= 19;
    // Check if a report has already been submitted today
    const isSubmitted = todaysReport?.status === 'Submitted';
    return isPastCutoff || isSubmitted;
  }, [todaysReport]);

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
      .filter(([taskId, completion]) => completion > 0) // Only submit tasks with progress
      .map(([taskId, completion]) => ({ taskId, completion }));

    if (taskUpdates.length === 0) {
      toast.error("No progress updates to submit.");
      return;
    }

    try {
      await updateTodaysReport({
        employeeId: employeeId,
        content: JSON.stringify({ taskUpdates }),
        status: 'Submitted',
      }).unwrap();
      toast.success('Progress submitted successfully!');
    } catch (err) {
      toast.error(err.data?.message || 'Failed to submit progress.');
    }
  };

  if (isLoadingTasks || isLoadingReport) {
    return <div className="text-center p-10">Loading Report...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Today's Progress Report</h1>
          <p className="text-slate-500 mt-1">Update the completion status for your active tasks.</p>
        </div>
        {!isReadOnly && (
          <button onClick={handleSubmit} disabled={isUpdating} className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl text-sm disabled:bg-blue-400 transition-colors shadow-lg shadow-blue-500/30">
            {isUpdating ? <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" /> : <PaperAirplaneIcon className="h-5 w-5 mr-2" />}
            Submit Progress
          </button>
        )}
      </div>

      {isReadOnly && (
        <div className="bg-gradient-to-r from-amber-100 to-yellow-100 border-l-4 border-amber-500 text-amber-800 p-4 mb-6 rounded-r-lg shadow-sm" role="alert">
          <p className="font-bold">Reporting Closed for Today</p>
          <p className="text-sm">You can submit progress once daily before 7:00 PM. Today's report may have already been submitted or the deadline has passed.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assignedTasks.filter(t => t.status !== 'Completed').map((task, index) => (
          <div key={task._id} className="bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-lg border border-slate-200 flex flex-col">
            <div className="p-5 border-b border-slate-200"> 
              <h3 className="font-bold text-lg text-slate-800">
                Task {index + 1}: {task.title}
              </h3>
              <p className="text-sm text-slate-500 mt-1">{task.description}</p>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-4">
                <div className="relative w-full">
                  <div className="absolute top-1/2 -translate-y-1/2 h-2 w-full bg-slate-200 rounded-full"></div>
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-2 bg-blue-500 rounded-full"
                    style={{ width: `${progress[task._id] || 0}%` }}
                  ></div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    value={progress[task._id] || 0}
                    onChange={(e) => handleProgressChange(task._id, e.target.value)}
                    disabled={isReadOnly}
                    className="w-full h-2 bg-transparent appearance-none cursor-pointer disabled:cursor-not-allowed slider-thumb"
                  />
                </div>
                <span className={`font-bold w-16 text-center text-xl ${isReadOnly ? 'text-slate-500' : 'text-blue-600'}`}>
                  {progress[task._id] || 0}%
                </span>
              </div>
            </div>
          </div>
        ))}
        {assignedTasks.filter(t => t.status !== 'Completed').length === 0 && (
          <div className="lg:col-span-2 text-center py-16 text-slate-500 bg-white rounded-xl border border-dashed">
            <CheckCircleIcon className="h-12 w-12 mx-auto text-green-400" />
            <p className="mt-4 font-semibold text-lg">All tasks are completed!</p>
            <p className="text-sm">No pending tasks to report on.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const EmployeeDashboard = ({ employeeId }) => {
  // Inject Manrope font style once
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
      .font-manrope {
        font-family: 'Manrope', sans-serif;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const user = useSelector(selectCurrentUser);
  const [logout] = useLogoutMutation();
  const dispatch = useDispatch();
  const [activeComponent, setActiveComponent] = useState('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: notifications = [] } = useGetNotificationsQuery(undefined, { pollingInterval: 60000 });
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
    }
  }, [hasTeam, activeComponent]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileRef]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileRef]);

  const handleLogout = async () => {
    await logout();
  };

  const handleRefresh = () => {
    dispatch(apiSlice.util.resetApiState());
    toast.success("Data refreshed!");
  };

  const [markNotificationsAsRead] = useMarkNotificationsAsReadMutation();
  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  const handleBellClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
    if (unreadCount > 0) {
      setTimeout(() => {
        markNotificationsAsRead();
      }, 2000);
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.type === 'task_approval') {
      setActiveComponent('task-approvals');
    } else if (notification.type === 'info') {
      // Info notifications for employees are usually about their own tasks
      setActiveComponent('my-tasks');
    }
  };

  const handleClearRead = async () => {
    try {
      // You may need to implement a mutation for deleting read notifications if not already present
      await markNotificationsAsRead().unwrap();
      toast.success('Read notifications cleared.');
    } catch {
      toast.error('Failed to clear notifications.');
    }
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
        return <AttendanceCalendar employeeId={user._id} />;
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
    <div className="h-screen flex bg-gradient-to-br from-indigo-50 via-white to-blue-50 font-sans text-gray-800 font-manrope">
      <aside className={`fixed md:static z-50 top-0 left-0 h-full w-72 flex-shrink-0 border-r border-gray-200 bg-white/80 backdrop-blur-lg shadow-lg flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="h-16 flex items-center gap-3 px-4 border-b border-gray-200">
          <img
            src="/src/assets/fevicon.png"
            alt="Company Logo"
            className="h-9 w-9"
          />
          <span
            className="text-lg font-bold text-blue-800 truncate"
            title={user?.company}
          >
            {user?.company || 'Company Portal'}
          </span>
        </div>
        <nav className="p-4 space-y-2">
          <button onClick={() => { setActiveComponent('dashboard'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${activeComponent === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>
            <HomeIcon className="h-6 w-6" />
            <span className="font-semibold">Dashboard</span>
          </button>
          <button onClick={() => { setActiveComponent('my-report'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${activeComponent === 'my-report' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>
            <DocumentTextIcon className="h-6 w-6" />
            <span className="font-semibold">Today's Report</span>
          </button>
          {hasTeam && (
            <button onClick={() => { setActiveComponent('team-reports'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${activeComponent === 'team-reports' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>
              <UserGroupIcon className="h-6 w-6" />
              <span className="font-semibold">Team Reports</span>
            </button>
          )}
          {hasTeam && (
            <button onClick={() => { setActiveComponent('team-info'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${activeComponent === 'team-info' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>
              <InformationCircleIcon className="h-6 w-6" />
              <span className="font-semibold">Team Information</span>
            </button>
          )}
          {(user?.role === 'Admin' || user?.canViewAnalytics) && (
            <button onClick={() => { setActiveComponent('analytics'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${activeComponent === 'analytics' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>
              <ChartBarIcon className="h-6 w-6" />
              <span className="font-semibold">Analytics</span>
            </button>
          )}
          <button onClick={() => { setActiveComponent('attendance'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${activeComponent === 'attendance' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>
            <CalendarDaysIcon className="h-6 w-6" />
            <span className="font-semibold">My Attendance</span>
          </button>
          <button onClick={() => { setActiveComponent('my-tasks'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${activeComponent === 'my-tasks' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>
            <ClipboardDocumentListIcon className="h-6 w-6" />
            <span className="font-semibold">My Tasks</span>
          </button>
          <button onClick={() => { setActiveComponent('my-history'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${activeComponent === 'my-history' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>
            <ArchiveBoxIcon className="h-6 w-6" />
            <span className="font-semibold">My Report History</span>
          </button>
          
          {hasTeam && (user?.role === 'Admin' || user?.canApproveTask) && (
          <button onClick={() => { setActiveComponent('task-approvals'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${activeComponent === 'task-approvals' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>
            <CheckBadgeIcon className="h-6 w-6" />
            <span className="font-semibold">Task Approvals</span>
          </button>
          )}
          {hasTeam && (user?.role === 'Admin' || user?.canAssignTask) && (
            <button onClick={() => { setActiveComponent('assign-task'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${activeComponent === 'assign-task' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>
              <ClipboardDocumentListIcon className="h-6 w-6" />
              <span className="font-semibold">Assign Task</span>
            </button>
          )}
          {hasTeam && (
            <button onClick={() => { setActiveComponent('view-team-tasks'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${activeComponent === 'view-team-tasks' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>
              <EyeIcon className="h-6 w-6" />
              <span className="font-semibold">View Team Tasks</span>
            </button>
          )}
        </nav>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>}
      <div className="flex-1 flex flex-col overflow-hidden pt-16 md:pt-0">
          <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 h-16 flex-shrink-0 shadow z-50 fixed top-0 left-0 right-0 md:relative md:left-auto">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-600">
              <Bars3Icon className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800 md:text-xl">
              {pageTitles[activeComponent] || 'Dashboard'}
            </h1>
            <div className="flex items-center gap-4">
              <button onClick={handleRefresh} className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100" title="Refresh Data">
                <ArrowPathIcon className="h-6 w-6" />
              </button>
              <div className="relative" ref={notificationRef}>
                <button onClick={handleBellClick} className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 relative">
                  <BellIcon className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                  )}
                </button>
                {isNotificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-60">
                    <div className="p-3 font-semibold text-sm border-b">Notifications</div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? notifications.map(n => (
                        <div 
                          key={n._id} 
                          onClick={() => handleNotificationClick(n)}
                          className={`p-3 border-b text-xs cursor-pointer transition-colors ${!n.isRead ? 'bg-blue-50' : 'hover:bg-slate-100'}`}
                        >
                          <p className="text-slate-700">{n.message}</p>
                          <p className="text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                        </div>
                      )) : (
                        <p className="p-4 text-center text-sm text-gray-500">No notifications</p>
                      )}
                    </div>
                      <div className="p-2 border-t bg-slate-50 text-center">
                        <button onClick={handleClearRead} className="text-xs font-semibold text-blue-600 hover:text-blue-800">Clear Read Notifications</button>
                      </div>
                  </div>
                )}
              </div>

              <div className="w-px h-6 bg-gray-200"></div>
              <div className="relative" ref={profileRef}>
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                  <img
                    src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.name || 'A'}&background=random`}
                    alt="Employee"
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-semibold text-gray-900">{user?.name || 'Employee'}</div>
                    <div className="text-xs text-gray-500">{user?.role || 'Employee'}</div>
                  </div>
                  <ChevronDownIcon className={`h-5 w-5 text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-60 border border-gray-200">
                    {user?.canEditProfile && (
                      <button onClick={() => { setActiveComponent('profile'); setIsProfileOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <UserCircleIcon className="h-5 w-5" />
                        My Profile
                      </button>
                    )}
                    <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto bg-slate-50">
            {renderContent()}
          </main>
        </div>
      </div>
   );
};

export default EmployeeDashboard;