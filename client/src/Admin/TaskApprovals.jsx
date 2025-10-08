import React, { useState, useMemo, useEffect } from 'react';
import { useGetNotificationsQuery, useApproveTaskMutation, useRejectTaskMutation, useMarkNotificationsAsReadMutation, useProcessPastDueTasksMutation } from '../services/EmployeApi.js';
import toast from 'react-hot-toast';
import { CheckIcon, XMarkIcon, ArrowPathIcon, EyeIcon, CalendarDaysIcon, InformationCircleIcon, InboxIcon } from '@heroicons/react/24/outline';
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

const ApproveModal = ({ isOpen, onClose, onConfirm, isApproving }) => {
  const [comment, setComment] = useState('');
  const [finalPercentage, setFinalPercentage] = useState(100);

  if (!isOpen) return null;

  const getGradeFromPercentage = (p) => {
    if (p === 100) return { label: 'Completed', color: 'text-emerald-600' };
    if (p >= 80) return { label: 'Moderate', color: 'text-blue-600' };
    if (p >= 60) return { label: 'Low', color: 'text-amber-600' };
    return { label: 'Pending', color: 'text-red-600' };
  };

  const currentGrade = getGradeFromPercentage(finalPercentage);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-slate-800">Approve Task Completion</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Final Progress</label>
            <div className="flex items-center gap-4">
              <input
                type="range" min="0" max="100" step="10"
                value={finalPercentage}
                onChange={(e) => setFinalPercentage(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-right w-24">
                <span className="font-semibold text-blue-700">{finalPercentage}%</span>
                <span className={`block text-xs font-bold ${currentGrade.color}`}>{currentGrade.label}</span>
              </div>
            </div>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add an optional comment... (e.g., Great work!)"
            className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
          />
        </div>
        <div className="p-4 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="bg-white hover:bg-slate-100 text-slate-700 font-bold py-2 px-4 rounded-lg border border-slate-300 text-sm">Cancel</button>
          <button onClick={() => onConfirm(finalPercentage, comment)} disabled={isApproving} className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-sm disabled:bg-green-300">
            {isApproving && <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />}
            Confirm Approval
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
  const [approvingNotification, setApprovingNotification] = useState(null);

  useEffect(() => {
    // When the component mounts, trigger the backend to process past-due tasks.
    // This moves tasks to 'Pending Verification' after their due date.
    processPastDueTasks();
  }, [processPastDueTasks]);

  const approvalRequests = useMemo(() => {
    return notifications.filter(n => n.type === 'task_approval' && n.relatedTask);
  }, [notifications]);

  const handleApprove = (notification) => {
    setApprovingNotification(notification);
  };

  const handleConfirmApprove = async (finalPercentage, comment) => {
    if (!approvingNotification) return;
    try {
      await approveTask({ id: approvingNotification.relatedTask._id, finalPercentage, comment }).unwrap();
      toast.success('Task approved!');
      setApprovingNotification(null);
    } catch (err) {
      toast.error('Failed to approve task.');
    }
  };

  const handleReject = (notification) => {
    setRejectingNotification(notification);
  };

  const handleConfirmReject = async (reason, finalPercentage) => {
    if (!rejectingNotification) return;
    try {
      await rejectTask({ id: rejectingNotification.relatedTask._id, reason, finalPercentage }).unwrap();
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
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col bg-slate-50/50">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Task Completion Approvals</h1>
        <p className="text-slate-500 mt-2">Review and approve or reject tasks marked as complete by your team.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {approvalRequests.length > 0 ? (
          approvalRequests.map(notification => (
            <div key={notification._id} className="bg-white rounded-xl border border-slate-200 shadow-lg p-5 flex flex-col justify-between hover:shadow-xl transition-shadow">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <img src={notification.subjectEmployee.profilePicture || `https://ui-avatars.com/api/?name=${notification.subjectEmployee.name}`} alt={notification.subjectEmployee.name} className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <p className="font-bold text-slate-800">{notification.subjectEmployee.name}</p>
                    <p className="text-xs text-slate-500">Submitted for approval</p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-blue-700 my-2">"{notification.relatedTask.title}"</p>
                <p className="text-xs text-slate-400">Submitted on: {new Date(notification.createdAt).toLocaleString()}</p>
                <div className="mt-3">
                  <p className="text-sm font-semibold text-slate-600">Submitted Progress:</p>
                  <p className="text-2xl font-bold text-blue-600">{notification.relatedTask.progress}%</p>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button onClick={() => setViewingTask(notification.relatedTask)} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700">
                  <EyeIcon className="h-4 w-4" /> View Details
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleReject(notification)} disabled={isApproving || isRejecting} className="inline-flex items-center gap-2 bg-red-100 text-red-700 hover:bg-red-200 font-bold py-1.5 px-3 rounded-lg text-xs transition-colors">
                    <XMarkIcon className="h-4 w-4" /> Reject
                  </button>
                  <button onClick={() => handleApprove(notification)} disabled={isApproving || isRejecting} className="inline-flex items-center gap-2 bg-green-100 text-green-700 hover:bg-green-200 font-bold py-1.5 px-3 rounded-lg text-xs transition-colors">
                    {isApproving ? <ArrowPathIcon className="animate-spin h-4 w-4" /> : <CheckIcon className="h-4 w-4" />} Approve
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="md:col-span-2 lg:col-span-3 text-center py-24 text-slate-500 bg-white rounded-xl border border-dashed">
            <InboxIcon className="h-16 w-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold">All Caught Up!</h3>
            <p className="text-sm">There are no pending task approvals at this time.</p>
          </div>
        )}
      </div>
      <RejectModal
        isOpen={!!rejectingNotification}
        onClose={() => setRejectingNotification(null)}
        onConfirm={handleConfirmReject}
        isRejecting={isRejecting}
      />
      <ApproveModal
        isOpen={!!approvingNotification}
        onClose={() => setApprovingNotification(null)}
        onConfirm={handleConfirmApprove}
        isApproving={isApproving}
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