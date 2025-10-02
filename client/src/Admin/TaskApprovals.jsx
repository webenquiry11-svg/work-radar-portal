import React, { useState, useMemo, useEffect } from 'react';
import { useGetNotificationsQuery, useApproveTaskMutation, useRejectTaskMutation, useMarkNotificationsAsReadMutation, useProcessPastDueTasksMutation } from '../services/EmployeApi.js';
import toast from 'react-hot-toast';
import { CheckIcon, XMarkIcon, ArrowPathIcon, EyeIcon, CalendarDaysIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../app/authSlice';

const RejectModal = ({ isOpen, onClose, onConfirm, isRejecting }) => {
  const [reason, setReason] = useState('');
  const [finalPercentage, setFinalPercentage] = useState(80);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-slate-800">Reason for Rejection</h3>
        </div>
        <div className="p-6">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide a clear reason for rejecting this task completion..."
            className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
            rows="4"
          />
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Set Final Progress</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="90" // Cannot reject and give 100%
                step="10"
                value={finalPercentage}
                onChange={(e) => setFinalPercentage(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="font-semibold w-12 text-right text-blue-700">{finalPercentage}%</span>
            </div>
          </div>
        </div>
        <div className="p-4 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="bg-white hover:bg-slate-100 text-slate-700 font-bold py-2 px-4 rounded-lg border border-slate-300 text-sm">Cancel</button>
          <button onClick={() => onConfirm(reason, finalPercentage)} disabled={!reason || isRejecting} className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm disabled:bg-red-300">
            {isRejecting && <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />}
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
};

const TaskDetailsModal = ({ isOpen, onClose, task }) => {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Task Details</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <h4 className="font-bold text-lg text-blue-700">{task.title}</h4>
          <p className="text-sm text-slate-600">{task.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
            <InfoField label="Priority" value={task.priority} icon={InformationCircleIcon} />
            <InfoField label="Status" value={task.status} icon={CheckIcon} />
            <InfoField label="Start Date" value={task.startDate ? new Date(task.startDate).toLocaleDateString() : 'N/A'} icon={CalendarDaysIcon} />
            <InfoField label="Due Date" value={task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'} icon={CalendarDaysIcon} />
          </div>
        </div>
        <div className="p-4 bg-slate-50 rounded-b-lg flex justify-end">
          <button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm">Close</button>
        </div>
      </div>
    </div>
  );
};

const TaskApprovals = () => {
  const { data: notifications = [], isLoading } = useGetNotificationsQuery(undefined, { pollingInterval: 30000 });
  const [approveTask, { isLoading: isApproving }] = useApproveTaskMutation();
  const [rejectTask, { isLoading: isRejecting }] = useRejectTaskMutation();
  const [markNotificationsAsRead] = useMarkNotificationsAsReadMutation();
  const [processPastDueTasks, { isLoading: isProcessing }] = useProcessPastDueTasksMutation();
  const currentUser = useSelector(selectCurrentUser);
  const [rejectingNotification, setRejectingNotification] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);

  useEffect(() => {
    // When the component mounts, trigger the backend to process past-due tasks.
    // This moves tasks to 'Pending Verification' after their due date.
    processPastDueTasks();
  }, [processPastDueTasks]);

  const approvalRequests = useMemo(() => {
    return notifications.filter(n => n.type === 'task_approval' && n.relatedTask);
  }, [notifications]);

  const approvalWindowMessage = (
    <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-700 p-4 rounded-r-lg" role="alert">
      <p className="font-bold">Approval Window Closed</p>
      <p>Task approvals and rejections can only be processed between Saturday 7:00 PM and Sunday 7:00 PM.</p>
    </div>
  );

  const isApprovalWindowActive = () => {
    if (currentUser?.role === 'Admin') {
      return true; // Admins can always approve.
    }
    const now = new Date();
    const day = now.getDay(); // Sunday = 0, Saturday = 6
    const hour = now.getHours();

    const isSaturdayAfter7PM = (day === 6 && hour >= 19);
    const isSundayBefore7PM = (day === 0 && hour < 19);

    return isSaturdayAfter7PM || isSundayBefore7PM;
  };

  const handleApprove = async (notification) => {
    if (!isApprovalWindowActive()) {
      toast.error('Approvals are only allowed between Saturday 7 PM and Sunday 7 PM.');
      return;
    }
    try {
      await approveTask(notification.relatedTask._id).unwrap();
      await markNotificationsAsRead().unwrap(); // Mark all as read for simplicity
      toast.success('Task approved!');
    } catch (err) {
      toast.error('Failed to approve task.');
    }
  };

  const handleReject = (notification) => {
    if (!isApprovalWindowActive()) {
      toast.error('Rejections are only allowed between Saturday 7 PM and Sunday 7 PM.');
      return;
    }
    setRejectingNotification(notification);
  };

  const handleConfirmReject = async (reason, finalPercentage) => {
    if (!isApprovalWindowActive()) {
      toast.error('Rejections are only allowed between Saturday 7 PM and Sunday 7 PM.');
      return;
    }
    if (!rejectingNotification) return;
    try {
      await rejectTask({ id: rejectingNotification.relatedTask._id, reason, finalPercentage }).unwrap();
      await markNotificationsAsRead().unwrap();
      toast.success('Task rejected and feedback sent.');
      setRejectingNotification(null);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to reject task.');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading approval requests...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Task Completion Approvals</h1>
        <p className="text-slate-500 mt-2">Review and approve or reject tasks marked as complete by your team.</p>
        {currentUser?.role !== 'Admin' && !isApprovalWindowActive() && approvalWindowMessage}
      </div>
      <div className="space-y-4">
        {approvalRequests.length > 0 ? (
          approvalRequests.map(notification => (
            <div key={notification._id} className="bg-white rounded-xl border border-slate-200 shadow-lg p-5">
              <p className="text-slate-700"><span className="font-bold">{notification.subjectEmployee.name}</span> has marked a task as complete:</p>
              <p className="text-lg font-semibold text-blue-700 my-2">"{notification.relatedTask.title}"</p>
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => setViewingTask(notification.relatedTask)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  <EyeIcon className="h-4 w-4" /> View Details
                </button>
                <div className="flex items-center gap-3">
                <button
                  onClick={() => handleReject(notification)}
                  disabled={isApproving || isRejecting}
                  className="inline-flex items-center gap-2 bg-red-100 text-red-700 hover:bg-red-200 font-bold py-1.5 px-4 rounded-lg text-sm transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(notification)}
                  disabled={isApproving || isRejecting}
                  className="inline-flex items-center gap-2 bg-green-100 text-green-700 hover:bg-green-200 font-bold py-1.5 px-4 rounded-lg text-sm transition-colors"
                >
                  {isApproving ? <ArrowPathIcon className="animate-spin h-4 w-4" /> : <CheckIcon className="h-4 w-4" />}
                  Approve
                </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 text-slate-500 bg-white rounded-xl border border-dashed">
            <p className="font-semibold">No pending approvals at this time.</p>
          </div>
        )}
      </div>
      <RejectModal
        isOpen={!!rejectingNotification}
        onClose={() => setRejectingNotification(null)}
        onConfirm={handleConfirmReject}
        isRejecting={isRejecting}
      />
      <TaskDetailsModal
        isOpen={!!viewingTask}
        onClose={() => setViewingTask(null)}
        task={viewingTask}
      />
    </div>
  );
};

export default TaskApprovals;