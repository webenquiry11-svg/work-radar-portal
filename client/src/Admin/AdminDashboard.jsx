import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  HomeIcon, UsersIcon, BellIcon, ChevronDownIcon, ClipboardDocumentCheckIcon, ArrowRightOnRectangleIcon, UserCircleIcon, UserGroupIcon, CalendarDaysIcon, ArrowPathIcon, ClipboardDocumentListIcon, EyeIcon, DocumentTextIcon, CheckCircleIcon, ArrowDownTrayIcon, ListBulletIcon, CheckBadgeIcon, ChartBarIcon, TrophyIcon, ShieldCheckIcon, StarIcon, ExclamationTriangleIcon, TrashIcon, ChatBubbleLeftEllipsisIcon, PaperAirplaneIcon, Cog6ToothIcon, MegaphoneIcon, ChevronDoubleLeftIcon, ArrowLeftIcon, BuildingOffice2Icon, BuildingLibraryIcon
} from '@heroicons/react/24/outline';
import { Bars3Icon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import EmployeeManagement from './EmployeeManagement';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, setCredentials } from '../app/authSlice';
import { useLogoutMutation } from '../services/apiSlice';
import { apiSlice } from '../services/apiSlice';
import AssignEmployee from './AssignEmployee';
import { useGetEmployeesQuery, useGetReportsByEmployeeQuery, useUpdateEmployeeMutation, useGetNotificationsQuery, useMarkNotificationsAsReadMutation, useGetAllTasksQuery, useDeleteReportMutation, useDeleteReadNotificationsMutation, useAddTaskCommentMutation, useGetDashboardStatsQuery, useGetOfficialEOMQuery, useGetActiveAnnouncementQuery } from '../services/EmployeApi';
import Dashboard from './Dashboard';
import HolidayManagement from './HolidayManagement';
import ViewAllTasks from './ViewAllTasks';
import TaskOverview from './TaskOverview';
import TaskApprovals from './TaskApprovals';
import AssignTask from './AssignTask';
import EmployeeOfTheMonth from './EmployeeOfTheMonth'; // New import
import HallOfFame from './HallOfFame';
import AdminProfile from './AdminProfile'; 
import ThemeToggle from '../ThemeToggle';
import ManageAnnouncements from './ManageAnnouncements';
import AllEmployeeAttendance from './AllEmployeeAttendance';
import GooglePieChart from './GooglePieChart.jsx';
import { XMarkIcon, CalendarDaysIcon as CalendarOutlineIcon, InformationCircleIcon as InfoOutlineIcon } from '@heroicons/react/24/outline';
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
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl h-auto max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Task Details</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <h4 className="font-bold text-xl text-blue-700 dark:text-blue-400">
                {task.title} 
                {taskNumber && <span className="ml-2 text-sm font-medium text-slate-400">(Task {taskNumber})</span>}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">{task.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t dark:border-slate-700">
                <InfoField label="Priority" value={task.priority} icon={InfoOutlineIcon} />
                <InfoField label="Status" value={task.status} icon={CheckCircleIcon} />
                <InfoField label="Start Date" value={task.startDate ? new Date(task.startDate).toLocaleDateString() : 'N/A'} icon={CalendarOutlineIcon} />
                <InfoField label="Due Date" value={task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'} icon={CalendarOutlineIcon} />
              </div>
            </div>
            <div className="md:col-span-1 bg-slate-50 p-3 rounded-xl border flex flex-col h-[350px] w-full max-w-xs mx-auto">
              <div className="flex items-center gap-2 mb-2 border-b pb-2 dark:border-slate-700">
                <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-blue-500" />
                <h5 className="font-semibold text-slate-700 dark:text-slate-200 text-base">Comments</h5>
                <span className="ml-auto text-xs text-slate-400">{task.comments?.length || 0}</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {task.comments?.length > 0 ? (
                  task.comments.map(c => (
                    <div key={c._id} className="flex items-start gap-2 bg-white dark:bg-slate-700 rounded-lg p-2 border border-slate-100 dark:border-slate-600 shadow-sm">
                      {c.author.profilePicture ? (
                        <img
                          src={c.author.profilePicture}
                          alt={c.author.name}
                          className="h-8 w-8 rounded-full object-cover border border-blue-100"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-sm border border-blue-100">
                          {c.author.name?.split(' ').map(n => n[0]).join('').slice(0,2)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">{c.author.name}</span>
                          <span className="text-[10px] text-slate-400 ml-auto">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-xs text-slate-700 mt-0.5 break-words">{c.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 py-8">
                    <ChatBubbleLeftEllipsisIcon className="h-7 w-7 mb-2" />
                    <p className="text-xs">No comments yet.</p>
                  </div>
                )}
              </div>
              <form
                className="flex gap-2 pt-2 border-t mt-2"
                onSubmit={e => { e.preventDefault(); handleAddComment(); }} 
              >
                <input
                  type="text"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200"
                  disabled={isAddingComment}
                  maxLength={300}
                />
                <button
                  type="submit"
                  disabled={isAddingComment || !comment.trim()}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                  title="Send"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-b-lg flex justify-end">
          <button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm">Close</button>
        </div>
      </div>
    </div>
  );
};

const DeleteReportModal = ({ isOpen, onClose, onConfirm, report, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm">
        <div className="p-6 text-center">
          <div className="mx-auto bg-red-100 dark:bg-red-500/10 rounded-full h-12 w-12 flex items-center justify-center my-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Confirm Deletion</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Are you sure you want to permanently delete the report from <strong className="text-slate-700 dark:text-slate-300">{new Date(report.reportDate).toLocaleDateString()}</strong>? This action cannot be undone.</p>
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

const TeamReports = () => {
  const { data: employees, isLoading: isLoadingEmployees, isError: isErrorEmployees } = useGetEmployeesQuery();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingReport, setDeletingReport] = useState(null);
  const [viewingTaskNumber, setViewingTaskNumber] = useState(null);
  const [deleteReport, { isLoading: isDeleting }] = useDeleteReportMutation();

  const { data: reports, isLoading: isLoadingReports } = useGetReportsByEmployeeQuery(selectedEmployee?._id, {
    skip: !selectedEmployee,
  });

  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    return employees.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const handleDownloadSheet = () => {
    if (!selectedEmployee || !reports || reports.length === 0) {
      toast.error('No reports available to download for this employee.');
      return;
    }

    const dataForSheet = [];
    const headers = [
      'Employee Name', 'Employee ID', 'Report Date', 'Report Status',
      'Task Description', 'Time Spent', 'Task Status', 'Task Remark',
      'Summary', 'Key Achievements', 'Pending for Next Day'
    ];

    dataForSheet.push(headers);

    reports.forEach((report, index) => {
      let data = {};
      if (typeof report.content === 'object' && report.content !== null) {
        data = report.content;
      } else if (typeof report.content === 'string') {
        try { data = JSON.parse(report.content); } catch (e) { /* ignore */ }
      }

      const reportDate = new Date(report.reportDate).toLocaleDateString();
      const baseRow = [
        selectedEmployee.name, selectedEmployee.employeeId, reportDate, report.status,
      ];

      if (data.tasks && data.tasks.length > 0) {
        data.tasks.forEach(task => {
          const taskRow = [
            task.description || '', task.timeSpent || '', task.status || '', task.remark || '',
            data.summary || '', data.keyAchievements || '', data.pendingTasksNextDay || ''
          ];
          dataForSheet.push([...baseRow, ...taskRow]);
        });
      } else {
        // If no tasks, add a row with just the report info
        const emptyTaskRow = ['', '', '', '', data.summary || '', data.keyAchievements || '', data.pendingTasksNextDay || ''];
        dataForSheet.push([...baseRow, ...emptyTaskRow]);
      }
    });

    // Create a new workbook and a worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(dataForSheet);

    // --- Professional Styling ---

    // 1. Set column widths
    const columnWidths = [
      { wch: 22 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, // Employee, ID, Date, Status
      { wch: 55 }, { wch: 15 }, { wch: 15 }, { wch: 55 }, // Task fields
      { wch: 55 }, { wch: 55 }, { wch: 55 }  // Summary, Achievements, Pending
    ];
    ws['!cols'] = columnWidths;

    // 2. Define styles
    const border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFFFF" } },
      fill: { fgColor: { rgb: "FF4F81BD" } }, // Dark Blue
      alignment: { vertical: "center", horizontal: "center" },
      border,
    };
    const cellStyle = (isAlt) => ({
      fill: { fgColor: { rgb: isAlt ? "FFF2F2F2" : "FFFFFFFF" } }, // Zebra stripes
      alignment: { vertical: "top", wrapText: true },
      border,
    });
    const centeredCellStyle = (isAlt) => ({
      ...cellStyle(isAlt),
      alignment: { ...cellStyle(isAlt).alignment, horizontal: "center" },
    });

    // 3. Apply styles to all cells
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = { c: C, r: R };
        const address = XLSX.utils.encode_cell(cell_address);
        if (!ws[address]) continue;

        if (R === 0) { // Header row
          ws[address].s = headerStyle;
        } else { // Data rows
          const isAltRow = R % 2 === 0;
          // Center align specific columns
          if ([2, 3, 5, 6].includes(C)) {
            ws[address].s = centeredCellStyle(isAltRow);
          } else {
            ws[address].s = cellStyle(isAltRow);
          }
        }
      }
    }

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Reports');

    // Generate and trigger the download of the .xlsx file
    XLSX.writeFile(wb, `Reports_${selectedEmployee.name.replace(/\s/g, '_')}.xlsx`);
  };

  const renderReportContent = (content) => {
    try {
      const data = JSON.parse(content);
      if (data.taskUpdates) { // Handle new progress-based reports
        return (
          <div className="space-y-3">
            {data.taskUpdates.map((update, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-slate-800">
                    Task {i + 1}: {update.taskId?.title || 'Unknown Task'}
                  </p>
                  <p className="text-sm text-slate-600">Progress Submitted: <span className="font-bold text-blue-600">{update.completion}%</span></p>
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
        );
      }
      return (
        <p className="whitespace-pre-line break-words">{JSON.stringify(data, null, 2)}</p>
      );
    } catch (e) {
      return <p className="whitespace-pre-line break-words">{content}</p>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full">
      {!selectedEmployee ? (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Team Reports</h1>
            <p className="text-slate-500 mt-2">Select an employee to view their submitted reports.</p>
          </div>
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md text-sm border border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 dark:text-white"
            />
          </div>
          {isLoadingEmployees ? (
            <p className="p-4 text-slate-500 dark:text-slate-400">Loading employees...</p>
          ) : isErrorEmployees ? (
            <p className="p-4 text-red-500">Failed to load employees.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEmployees.map(employee => (
                <div
                  key={employee._id}
                  onClick={() => setSelectedEmployee(employee)}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 flex flex-col items-center text-center border-t-4 border-blue-500 hover:scale-105 transition-transform duration-200 cursor-pointer"
                >
                  <img src={employee.profilePicture || `https://ui-avatars.com/api/?name=${employee.name}&background=random`} alt={employee.name} className="h-20 w-20 rounded-full object-cover mb-4 border-4 border-slate-100 dark:border-slate-600" />
                  <p className="font-bold text-slate-800 dark:text-slate-200">{employee.name}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{employee.role}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">{employee.employeeId}</p>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <button onClick={() => setSelectedEmployee(null)} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors">
                <ArrowLeftIcon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Reports for {selectedEmployee.name}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Review all submitted reports for this employee.</p>
              </div>
            </div>
            <button
              onClick={handleDownloadSheet}
              disabled={!reports || reports.length === 0}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl text-sm shadow transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              Download as Sheet
            </button>
          </div>

          {isLoadingReports && <p>Loading reports...</p>}
          <div className="space-y-6">
            {reports?.length > 0 ? reports.map(report => (
              <div key={report._id} className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-200 mb-4 flex flex-col sm:flex-row justify-between gap-2">
                  <span>{new Date(report.reportDate).toLocaleDateString('en-US', { dateStyle: 'full' })}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    report.status === 'Submitted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>{report.status}</span>
                </h3>
                <div className="mb-4">{renderReportContent(report.content)}</div>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 text-right">
                  <button onClick={() => setDeletingReport(report)} className="inline-flex items-center gap-2 text-xs font-semibold text-red-600 hover:text-red-700"><TrashIcon className="h-4 w-4" /> Delete Report</button>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-slate-400 dark:text-slate-500">No reports found for this employee.</div>
            )}
            {reports?.length === 0 && <p className="text-gray-500">No reports found for this employee.</p>}
          </div>
        </div>
      )}
      <TaskDetailsModal
        isOpen={!!viewingTask}
        onClose={() => setViewingTask(null)}
        task={viewingTask}
        taskNumber={viewingTaskNumber}
      />
      <DeleteReportModal
        isOpen={!!deletingReport}
        onClose={() => setDeletingReport(null)}
        onConfirm={async () => {
          await deleteReport(deletingReport._id).unwrap();
          toast.success('Report deleted.');
          setDeletingReport(null);
        }}
        report={deletingReport}
        isDeleting={isDeleting}
      />
    </div>
  );
};

const OldTeamReports = () => {
  const { data: employees, isLoading: isLoadingEmployees, isError: isErrorEmployees } = useGetEmployeesQuery();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingReport, setDeletingReport] = useState(null);
  const [viewingTaskNumber, setViewingTaskNumber] = useState(null);
  const [deleteReport, { isLoading: isDeleting }] = useDeleteReportMutation();

  const { data: reports, isLoading: isLoadingReports } = useGetReportsByEmployeeQuery(selectedEmployee?._id, {
    skip: !selectedEmployee,
  });

  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    return employees.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const handleDownloadSheet = () => {
    if (!selectedEmployee || !reports || reports.length === 0) {
      toast.error('No reports available to download for this employee.');
      return;
    }

    const dataForSheet = [];
    const headers = [
      'Employee Name', 'Employee ID', 'Report Date', 'Report Status',
      'Task Description', 'Time Spent', 'Task Status', 'Task Remark',
      'Summary', 'Key Achievements', 'Pending for Next Day'
    ];

    dataForSheet.push(headers);

    reports.forEach((report, index) => {
      let data = {};
      if (typeof report.content === 'object' && report.content !== null) {
        data = report.content;
      } else if (typeof report.content === 'string') {
        try { data = JSON.parse(report.content); } catch (e) { /* ignore */ }
      }

      const reportDate = new Date(report.reportDate).toLocaleDateString();
      const baseRow = [
        selectedEmployee.name, selectedEmployee.employeeId, reportDate, report.status,
      ];

      if (data.tasks && data.tasks.length > 0) {
        data.tasks.forEach(task => {
          const taskRow = [
            task.description || '', task.timeSpent || '', task.status || '', task.remark || '',
            data.summary || '', data.keyAchievements || '', data.pendingTasksNextDay || ''
          ];
          dataForSheet.push([...baseRow, ...taskRow]);
        });
      } else {
        // If no tasks, add a row with just the report info
        const emptyTaskRow = ['', '', '', '', data.summary || '', data.keyAchievements || '', data.pendingTasksNextDay || ''];
        dataForSheet.push([...baseRow, ...emptyTaskRow]);
      }
    });

    // Create a new workbook and a worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(dataForSheet);

    // --- Professional Styling ---

    // 1. Set column widths
    const columnWidths = [
      { wch: 22 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, // Employee, ID, Date, Status
      { wch: 55 }, { wch: 15 }, { wch: 15 }, { wch: 55 }, // Task fields
      { wch: 55 }, { wch: 55 }, { wch: 55 }  // Summary, Achievements, Pending
    ];
    ws['!cols'] = columnWidths;

    // 2. Define styles
    const border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFFFF" } },
      fill: { fgColor: { rgb: "FF4F81BD" } }, // Dark Blue
      alignment: { vertical: "center", horizontal: "center" },
      border,
    };
    const cellStyle = (isAlt) => ({
      fill: { fgColor: { rgb: isAlt ? "FFF2F2F2" : "FFFFFFFF" } }, // Zebra stripes
      alignment: { vertical: "top", wrapText: true },
      border,
    });
    const centeredCellStyle = (isAlt) => ({
      ...cellStyle(isAlt),
      alignment: { ...cellStyle(isAlt).alignment, horizontal: "center" },
    });

    // 3. Apply styles to all cells
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = { c: C, r: R };
        const address = XLSX.utils.encode_cell(cell_address);
        if (!ws[address]) continue;

        if (R === 0) { // Header row
          ws[address].s = headerStyle;
        } else { // Data rows
          const isAltRow = R % 2 === 0;
          // Center align specific columns
          if ([2, 3, 5, 6].includes(C)) {
            ws[address].s = centeredCellStyle(isAltRow);
          } else {
            ws[address].s = cellStyle(isAltRow);
          }
        }
      }
    }

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Reports');

    // Generate and trigger the download of the .xlsx file
    XLSX.writeFile(wb, `Reports_${selectedEmployee.name.replace(/\s/g, '_')}.xlsx`);
  };

  const renderReportContent = (content) => {
    try {
      const data = JSON.parse(content);
      if (data.taskUpdates) { // Handle new progress-based reports
        return (
          <div className="space-y-3">
            {data.taskUpdates.map((update, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-slate-800">
                    Task {i + 1}: {update.taskId?.title || 'Unknown Task'}
                  </p>
                  <p className="text-sm text-slate-600">Progress Submitted: <span className="font-bold text-blue-600">{update.completion}%</span></p>
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
        );
      }
      return (
        <p className="whitespace-pre-line break-words">{JSON.stringify(data, null, 2)}</p>
      );
    } catch (e) {
      return <p className="whitespace-pre-line break-words">{content}</p>;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full bg-slate-50 dark:bg-slate-900/50">
      <div className="w-full md:w-1/3 max-w-sm bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Employees</h2>
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-3 w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 dark:bg-slate-700 dark:text-white"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoadingEmployees && <p className="p-4 text-slate-500 dark:text-slate-400">Loading employees...</p>}
          {isErrorEmployees && <p className="p-4 text-red-500">Failed to load employees.</p>}
          <ul className="p-2">
            {filteredEmployees.map(employee => (
              <li key={employee._id}>
                <button
                  onClick={() => setSelectedEmployee(employee)}
                  className={`w-full text-left p-3 my-1 rounded-lg transition-all duration-200 flex items-center gap-3 dark:hover:bg-slate-700 ${
                    selectedEmployee?._id === employee._id
                      ? 'bg-blue-100'
                      : 'hover:bg-slate-100'
                  }`}
                >
                  <img src={employee.profilePicture || `https://ui-avatars.com/api/?name=${employee.name}&background=random`} alt={employee.name} className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <p className={`font-semibold ${selectedEmployee?._id === employee._id ? 'text-blue-800' : 'text-slate-800 dark:text-slate-200'}`}>{employee.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{employee.role}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {!selectedEmployee ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-slate-400">Select an employee to view their reports.</div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Reports for {selectedEmployee.name}</h2>
              <button
                onClick={handleDownloadSheet}
                disabled={!reports || reports.length === 0}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl text-sm shadow transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                Download as Sheet
              </button>
            </div>

            {isLoadingReports && <p>Loading reports...</p>}
            <div className="space-y-6">
              {reports?.length > 0 ? reports.map(report => (
                <div key={report._id} className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-200 mb-4 flex flex-col sm:flex-row justify-between gap-2">
                    <span>{new Date(report.reportDate).toLocaleDateString('en-US', { dateStyle: 'full' })}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      report.status === 'Submitted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>{report.status}</span>
                  </h3>
                  <div className="mb-4">{renderReportContent(report.content)}</div>
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700 text-right">
                    <button onClick={() => setDeletingReport(report)} className="inline-flex items-center gap-2 text-xs font-semibold text-red-600 hover:text-red-700"><TrashIcon className="h-4 w-4" /> Delete Report</button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 text-slate-400 dark:text-slate-500">No reports found for this employee.</div>
              )}
              {reports?.length === 0 && <p className="text-gray-500">No reports found for this employee.</p>}
            </div>
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

const Analytics = () => {
  const { data: allEmployees = [], isLoading: isLoadingEmployees } = useGetEmployeesQuery(); 
  const { data: allTasks = [], isLoading: isLoadingTasks } = useGetAllTasksQuery();
  const [selectedManager, setSelectedManager] = useState(null);
  const [view, setView] = useState('team_stats'); // 'team_stats' or 'manager_stats'
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  const managers = useMemo(() => {
    return allEmployees.filter(emp => emp.dashboardAccess === 'Manager Dashboard');
  }, [allEmployees]);

  const teamMemberIds = useMemo(() => { 
    if (!selectedManager || !allEmployees) return new Set();
    
    const queue = allEmployees.filter(emp => emp.teamLead?._id === selectedManager._id);
    const visited = new Set(queue.map(e => e._id));
    const teamIds = new Set(queue.map(e => e._id));
    
    while (queue.length > 0) {
      const currentEmployee = queue.shift();
      const directReports = allEmployees.filter(emp => emp.teamLead?._id === currentEmployee._id);
      for (const report of directReports) {
        if (!visited.has(report._id)) {
          visited.add(report._id);
          teamIds.add(report._id);
          queue.push(report);
        }
      }
    }
    return teamIds;
  }, [allEmployees, selectedManager]);

  const { performanceStats, title } = useMemo(() => {
    const stats = {
      totalGradedTasks: 0,
      totalProgress: 0,
      averageCompletion: 0,
      tasksInProgress: 0,
      tasksInVerification: 0,
      pending: 0,
      inProgress: 0,
      pendingVerification: 0,
      completed: 0,
      notCompleted: 0,
    };
    if (!selectedManager) return { performanceStats: stats, title: "Manager & Team Analytics" };

    let relevantTasks = [];
    let viewTitle = '';

    if (selectedEmployee) {
      relevantTasks = allTasks.filter(task => task.assignedTo?._id === selectedEmployee._id);
      viewTitle = `Analytics for ${selectedEmployee.name}`;
    } else {
      if (view === 'manager_stats') {
        relevantTasks = allTasks.filter(task => task.assignedTo?._id === selectedManager._id);
        viewTitle = `Analytics for ${selectedManager.name}`;
      } else { // team_stats
        relevantTasks = allTasks.filter(task => teamMemberIds.has(task.assignedTo?._id));
        viewTitle = `Analytics for ${selectedManager.name}'s Team`;
      }
    }
    
    let dateFilteredTasks = relevantTasks;

    // Apply date range filter if dates are selected
    if (dateRange.startDate && dateRange.endDate) {
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      end.setHours(23, 59, 59, 999); // Include the whole end day

      dateFilteredTasks = relevantTasks.filter(task => {
        const assignedDate = new Date(task.createdAt);
        return assignedDate >= start && assignedDate <= end;
      });
    }

    const gradedTasks = dateFilteredTasks.filter(task => task.status === 'Completed' || task.status === 'Not Completed');
    stats.totalGradedTasks = dateFilteredTasks.length;
    gradedTasks.forEach(task => {
      stats.totalProgress += task.progress || 0;
    });
    stats.averageCompletion = gradedTasks.length > 0 ? (stats.totalProgress / gradedTasks.length) : 0;
    stats.tasksInProgress = relevantTasks.filter(t => t.status === 'In Progress' && !t.rejectionReason).length;
    stats.tasksInVerification = relevantTasks.filter(t => t.status === 'Pending Verification').length;

    relevantTasks.forEach(task => {
      switch(task.status) {
        case 'Pending': stats.pending++; break;
        case 'In Progress': stats.inProgress++; break;
        case 'Pending Verification': stats.pendingVerification++; break;
        case 'Completed': stats.completed++; break;
        case 'Not Completed': stats.notCompleted++; break;
      }
    });

    return { performanceStats: stats, title: viewTitle };
  }, [allTasks, selectedManager, selectedEmployee, teamMemberIds, view, dateRange]);

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
    'Avg. Completion': '#10B981', // Green
    'Graded Tasks': '#3B82F6', // Blue
    'In Progress': '#F59E0B', // Amber
    'In Verification': '#8B5CF6', // Purple
    'Pending Verification': '#8B5CF6', // Purple
    'Not Completed': '#f97316', // Orange
    'Completed': '#10B981', 'Moderate': '#3B82F6', 'Low': '#F59E0B', 'Pending': '#EF4444'
  };
  const GRADE_ICONS = { Completed: TrophyIcon, Moderate: ShieldCheckIcon, Low: StarIcon, Pending: ExclamationTriangleIcon };

  const StatCard = ({ grade, count }) => {
    const Icon = GRADE_ICONS[grade] || InfoOutlineIcon;
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

  if (isLoadingTasks || isLoadingEmployees) {
    return <div className="p-8 text-center">Loading analytics...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col bg-slate-50/50">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{title}</h1>
          <p className="text-slate-500 mt-2">Select a manager to view their team's performance.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative">
            <select 
              onChange={(e) => {
                const manager = managers.find(m => m._id === e.target.value);
                setSelectedManager(manager); 
                setSelectedEmployee(null); // Reset employee when manager changes
                setView('team_stats'); // Default to team view when manager changes
              }} 
              className="w-full sm:w-64 text-sm border border-slate-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white pr-8"
              value={selectedManager?._id || ''}
            >
              <option value="">-- Select a Manager --</option>
              {managers.map(manager => (
                <option key={manager._id} value={manager._id}>{manager.name}</option>
              ))}
            </select>
            <ChevronDownIcon className="h-5 w-5 text-slate-400 absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none" />
          </div>
          {selectedManager && (
            <div className="relative">
              <select
                onChange={(e) => {
                  const employee = allEmployees.find(emp => emp._id === e.target.value);
                  setSelectedEmployee(employee);
                }}
                className="w-full sm:w-64 text-sm border border-slate-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white pr-8"
                value={selectedEmployee?._id || ''}
              >
                <option value="">-- Select an Employee (Optional) --</option>
                {allEmployees.filter(e => teamMemberIds.has(e._id) || e._id === selectedManager._id).map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
              </select>
              <ChevronDownIcon className="h-5 w-5 text-slate-400 absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none" />
            </div>
          )}
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

      {selectedManager ? (
        <>
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-1 mb-8 w-fit mx-auto sm:mx-0">
            <button onClick={() => setView('manager_stats')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${view === 'manager_stats' ? 'bg-white text-blue-600 shadow' : 'text-slate-600'}`}>Manager Stats</button>
            <button onClick={() => setView('team_stats')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${view === 'team_stats' ? 'bg-white text-blue-600 shadow' : 'text-slate-600'}`}>Team Stats</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
            <StatCard grade="Avg. Completion" count={`${performanceStats.averageCompletion.toFixed(1)}%`} />
            <StatCard grade="Total Tasks" count={performanceStats.totalGradedTasks} />
            <StatCard grade="In Progress" count={performanceStats.tasksInProgress} />
            <StatCard grade="In Verification" count={performanceStats.tasksInVerification} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-lg p-8">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Task Status Overview</h3>
              {chartData.length > 0 ? (
                <div className="w-full h-[400px]"><GooglePieChart data={chartData} title="Grade Distribution" colors={GRADE_COLORS} /></div>
              ) : <div className="flex items-center justify-center h-full text-slate-500">No graded tasks to display for this team.</div>}
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8">
              <h3 className="text-lg font-bold text-slate-800 mb-4">How Grades Are Calculated</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex gap-3"><strong className="font-semibold text-emerald-600 w-20">Average:</strong><span>Calculated from the final progress percentage of all approved or rejected tasks.</span></li>
                <li className="flex gap-3"><strong className="font-semibold text-blue-600 w-20">Total Tasks:</strong><span>Includes all tasks assigned to the selected view, regardless of status.</span></li>
                <li className="flex gap-3"><strong className="font-semibold text-amber-600 w-20">In Progress:</strong><span>Tasks currently being worked on by employees.</span></li>
              </ul>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-16 text-slate-500 bg-white rounded-xl border border-dashed">
          <p className="font-semibold">Please select a manager to view their analytics.</p>
        </div>
      )}
    </div>
  );
};

const Sidebar = ({ activeComponent, setActiveComponent, sidebarOpen, setSidebarOpen, isCollapsed, setIsCollapsed }) => {
  const user = useSelector(selectCurrentUser);
  const [isHovering, setIsHovering] = useState(false);
  const isExpanded = !isCollapsed || isHovering;
  const navItems = [ 
    { id: 'dashboard', icon: HomeIcon, label: 'Dashboard' },
    { id: 'employees', icon: UsersIcon, label: 'Manage Employees' },
    { id: 'assign', icon: ClipboardDocumentCheckIcon, label: 'Assign Employee' },
    { id: 'team-reports', icon: UserGroupIcon, label: 'Team Reports' },
    { id: 'holidays', icon: CalendarDaysIcon, label: 'Holidays' }, { id: 'assign-task', icon: ClipboardDocumentListIcon, label: 'Assign Task' },
    { id: 'all-attendance', icon: CalendarDaysIcon, label: 'All Attendance' },
    { id: 'view-tasks', icon: EyeIcon, label: 'View All Tasks' },
    { id: 'task-overview', icon: ListBulletIcon, label: 'Task Overview' },
    { id: 'task-approvals', icon: CheckBadgeIcon, label: 'Task Approvals' },
    { id: 'employee-of-the-month', icon: TrophyIcon, label: 'Employee of the Month' },
    { id: 'analytics', icon: ChartBarIcon, label: 'Analytics' },
    { id: 'hall-of-fame', icon: BuildingLibraryIcon, label: 'Hall of Fame' },
    { id: 'announcements', icon: MegaphoneIcon, label: 'Announcements' },
  ];

  return (
    <div 
      className={`fixed md:sticky top-0 z-50 h-screen flex-shrink-0 transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${isExpanded ? 'w-64' : 'w-20'}`}
      onMouseEnter={() => isCollapsed && setIsHovering(true)}
      onMouseLeave={() => isCollapsed && setIsHovering(false)}
    >
      <aside className="h-full w-full bg-white/95 backdrop-blur-lg text-gray-800 flex flex-col border-r border-gray-200 shadow-xl dark:bg-slate-800/95 dark:border-slate-700">
        <div className={`h-16 flex items-center border-b border-gray-200 dark:border-slate-700 flex-shrink-0 ${isExpanded ? 'px-4 gap-3' : 'justify-center'}`}>
        {isExpanded && (
          <span className="text-lg font-bold text-blue-800 truncate" title={user?.company}>{user?.company || 'Company Portal'}</span>
        )}
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => { setActiveComponent(item.id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200 text-left relative ${!isExpanded && 'justify-center'} ${
              activeComponent === item.id
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <item.icon className="h-6 w-6 flex-shrink-0" />
            {isExpanded && <span>{item.label}</span>}
            {activeComponent === item.id && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-indigo-500 rounded-r-xl"></span>
            )}
          </button>
        ))}
      </nav>
      <div className="p-4 mt-auto border-t border-gray-200 dark:border-slate-700">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <ChevronDoubleLeftIcon className={`h-6 w-6 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>      </div>
      </aside>
    </div>
  );
};

const AppHeader = ({ pageTitle, user, setActiveComponent, onMenuClick }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const [logout] = useLogoutMutation();
  const { data: notifications = [] } = useGetNotificationsQuery(undefined, { pollingInterval: 30000 });
  const dispatch = useDispatch();
  const [markNotificationsAsRead] = useMarkNotificationsAsReadMutation();
  const [deleteReadNotifications] = useDeleteReadNotificationsMutation();

  useEffect(() => {
    // Close profile dropdown on outside click
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileRef]);

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  useEffect(() => {
    // Close notification dropdown on outside click
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationRef]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  const handleBellClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
    // When opening the notifications, mark them as read after a short delay
    if (!isNotificationOpen && unreadCount > 0) {
      setTimeout(() => {
        markNotificationsAsRead();
      }, 2000);
    }
  };

  const handleNotificationClick = (notification) => {
    setIsNotificationOpen(false); // Close dropdown on click
    if (notification.type === 'task_approval') {
      setActiveComponent('task-approvals');
    } else if (notification.type === 'info') {
      // Assuming 'info' notifications about tasks should lead to the task list
      setActiveComponent('view-tasks'); 
    }
  };

  const handleRefresh = () => {
    // Invalidate specific tags to refetch data without a full state reset
    dispatch(apiSlice.util.invalidateTags([
      { type: 'Employee', id: 'LIST' },
      'Task',
      'Notification',
      'Report',
      'Settings'
    ]));
    toast.success("Dashboard data refreshed!");
  };

  const handleClearRead = async () => {
    try {
      await deleteReadNotifications().unwrap();
      toast.success('Read notifications cleared.');
    } catch {
      toast.error('Failed to clear notifications.');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 md:relative z-30 h-16 bg-white/80 backdrop-blur-lg border-b border-gray-200 dark:border-slate-700/50 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 shadow dark:bg-slate-800/80">
      <div className="flex items-center gap-2">
        <button onClick={onMenuClick} className="md:hidden text-indigo-500 hover:text-indigo-700 p-2 rounded-full hover:bg-indigo-50 dark:text-slate-400 dark:hover:bg-slate-700">
          <Bars3Icon className="h-6 w-6" />
        </button>
        <h1 className="text-lg sm:text-xl font-semibold text-indigo-900 drop-shadow dark:text-slate-200 truncate">{pageTitle}</h1>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <div className="w-px h-6 bg-gray-200 dark:bg-slate-600"></div>
        <button onClick={handleRefresh} className="text-indigo-500 hover:text-indigo-700 p-2 rounded-full hover:bg-indigo-50 dark:text-slate-400 dark:hover:bg-slate-700" title="Refresh Data">
          <span className="sr-only">Refresh data</span>
          <ArrowPathIcon className="h-6 w-6" />
        </button>
        <div className="w-px h-6 bg-gray-200 dark:bg-slate-600"></div>
        <div className="relative" ref={notificationRef}>
          <button onClick={handleBellClick} className="text-indigo-500 hover:text-indigo-700 p-2 rounded-full hover:bg-indigo-50 dark:text-slate-400 dark:hover:bg-slate-700 relative group">
            <span className="sr-only">View notifications</span>
            <BellIcon className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
            )}
          </button>
          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-gray-200 dark:border-slate-700 z-60">
            <div className="p-3 font-semibold text-sm border-b dark:border-slate-700">Notifications</div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length > 0 ? notifications.map(n => (
                <div 
                  key={n._id} 
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3 border-b dark:border-slate-700 text-xs cursor-pointer transition-colors ${!n.isRead ? 'bg-blue-50 dark:bg-blue-900/50' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                >
                  <p className="text-slate-700 dark:text-slate-300">{n.message}</p>
                  <p className="text-slate-400 dark:text-slate-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              )) : (
                <p className="p-4 text-center text-sm text-gray-500">No notifications</p>
              )}
            </div>
            <div className="p-2 border-t bg-slate-50 dark:bg-slate-900/50 text-center">
              <button onClick={handleClearRead} className="text-xs font-semibold text-blue-600 hover:text-blue-800">Clear Read Notifications</button>
            </div>
          </div>
          )}
        </div>
        <div className="w-px h-6 bg-gray-200 dark:bg-slate-600"></div>
        <div className="relative" ref={profileRef}>
          <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
            <img
              src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.name || 'A'}&background=random`}
              alt="Admin"
              className="h-9 w-9 rounded-full object-cover"
            />
            <div className="text-left hidden sm:block">
              <div className="text-sm font-semibold text-gray-900 dark:text-slate-200">{user?.name || 'Admin'}</div>
              <div className="text-xs text-gray-500 dark:text-slate-400">{user?.role || 'Administrator'}</div>
            </div>
            <ChevronDownIcon className={`h-5 w-5 text-gray-500 dark:text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 z-60 border border-gray-200 dark:border-slate-700">
              <button onClick={() => { setActiveComponent('profile'); setIsProfileOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700">
                <UserCircleIcon className="h-5 w-5" />
                My Profile
              </button>
              <button onClick={logout} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default function AdminPageLayout() {
  const [activeView, setActiveView] = useState({ component: 'dashboard', props: {} });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const user = useSelector(selectCurrentUser);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteReadNotifications] = useDeleteReadNotificationsMutation();

  const pageTitles = {
    dashboard: 'Dashboard',
    employees: 'Manage Employees',
    assign: 'Assign Employee',
    'team-reports': 'Team Reports',
    'assign-task': 'Assign Task',
    holidays: 'Holiday Management',
    profile: 'My Profile',
    'view-tasks': 'All Tasks Overview',
    'task-overview': 'Task Status Overview',
    'task-approvals': 'Task Completion Approvals',
    'employee-of-the-month': 'Employee of the Month', // New item
    'hall-of-fame': 'Hall of Fame',
    'analytics': 'Team Analytics',
    'all-attendance': 'All Employee Attendance',
    'announcements': 'Manage Announcements',
  };

  const handleNavigation = (view) => {
    if (typeof view === 'string') {
      setActiveView({ component: view, props: {} });
    } else {
      setActiveView(view);
    }
  };

  const renderActiveComponent = () => {
    switch (activeView.component) {
      case 'dashboard': return <Dashboard onNavigate={handleNavigation} />;
      case 'employees': return <EmployeeManagement />;
      case 'assign': return <AssignEmployee />;
      case 'team-reports': return <TeamReports />;
      case 'holidays': return <HolidayManagement />; 
      case 'assign-task': return <AssignTask />;
      case 'view-tasks': return <ViewAllTasks {...activeView.props} />;
      case 'task-overview': return <TaskOverview />;
      case 'task-approvals': return <TaskApprovals />;
      case 'employee-of-the-month': return <EmployeeOfTheMonth />; // New component
      case 'hall-of-fame': return <HallOfFame />;
      case 'analytics': return <Analytics />;
      case 'announcements': return <ManageAnnouncements />;
      case 'all-attendance': return <AllEmployeeAttendance />;
      case 'profile': return <AdminProfile user={user} onNavigate={handleNavigation} />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 font-manrope dark:bg-slate-900">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
          .font-manrope {
            font-family: 'Manrope', sans-serif;
          }
        `}
      </style>
      <Sidebar activeComponent={activeView.component} setActiveComponent={handleNavigation} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>}
      <div className="flex-1 flex flex-col overflow-hidden pt-16 md:pt-0">
        <AppHeader pageTitle={pageTitles[activeView.component]} user={user} setActiveComponent={handleNavigation} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto dark:bg-slate-900">{renderActiveComponent()}</main>
      </div>
    </div>
  );
}