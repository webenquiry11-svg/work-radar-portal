import { apiSlice } from "./apiSlice";
import { setCredentials } from "../app/authSlice";

export const employeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Query to get dashboard stats
    getDashboardStats: builder.query({
      query: () => "stats", // FIX: No leading slash
      providesTags: (result, error, arg) => [{ type: "Employee", id: "LIST" }],
      pollingInterval: 30000,
    }),
    // Query to get manager dashboard stats
    getManagerDashboardStats: builder.query({
      query: (managerId) => `manager-stats/${managerId}`, // FIX: No leading slash
      providesTags: ["Report", { type: "Employee", id: "LIST" }],
      pollingInterval: 30000,
    }),
    // Query to get all employees
    getEmployees: builder.query({
      query: () => "employees", // FIX: No leading slash
      providesTags: (result = []) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: "Employee", id: _id })),
              { type: "Employee", id: "LIST" },
            ]
          : [{ type: "Employee", id: "LIST" }],
      pollingInterval: 30000,
    }),

    // Mutation to add a new employee
    addEmployee: builder.mutation({
      query: (newEmployee) => ({
        url: "employees", // FIX: No leading slash
        method: "POST",
        body: newEmployee,
      }),
      invalidatesTags: [{ type: "Employee", id: "LIST" }],
    }),
    // Mutation to update an employee
    updateEmployee: builder.mutation({
      query: ({ id, formData }) => ({
        url: `employees/${id}`, // FIX: No leading slash
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Employee", id },
        { type: "Employee", id: "LIST" },
      ],
      async onQueryStarted({ id }, { dispatch, queryFulfilled, getState }) {
        try {
          const { data: updatedData } = await queryFulfilled;
          const loggedInUser = getState().auth.user;
          const token = getState().auth.token;
          if (loggedInUser && loggedInUser._id === id && updatedData.employee) {
            dispatch(setCredentials({ user: updatedData.employee, token }));
          }
        } catch (err) {}
      },
    }),
    // Mutation to delete an employee
    deleteEmployee: builder.mutation({
      query: (id) => ({
        url: `employees/${id}`, // FIX: No leading slash
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Employee", id },
        { type: "Employee", id: "LIST" },
      ],
    }),
    // Mutation to assign an employee
    assignEmployee: builder.mutation({
      query: ({ employeeId, department, teamLeadId }) => ({
        url: `employees/${employeeId}/assign`, // FIX: No leading slash
        method: "PUT",
        body: { department, teamLeadId },
      }),
      invalidatesTags: (result, error, { employeeId, teamLeadId }) => [
        { type: "Employee", id: employeeId },
        { type: "Employee", id: teamLeadId },
        { type: "Employee", id: "LIST" },
        'User',
      ],
    }),
    // Mutation to unassign an employee
    unassignEmployee: builder.mutation({
      query: (employeeId) => ({
        url: `employees/${employeeId}/unassign`, // FIX: No leading slash
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, employeeId) => [
        { type: 'Employee', id: employeeId },
        { type: 'Employee', id: 'LIST' },
      ],
    }),

    // Mutation for user login
    login: builder.mutation({
      query: (credentials) => ({
        url: 'login', // FIX: No leading slash
        method: 'POST',
        body: credentials,
      }),
    }),

    getMe: builder.query({
      query: () => 'auth/me', // FIX: No leading slash
      providesTags: ['User'],
      pollingInterval: 30000, 
    }),
    
    // Setup endpoints
    checkAdminSetup: builder.query({
      query: () => 'setup/check', // FIX: No leading slash
    }),

    createAdmin: builder.mutation({
      query: (adminData) => ({
        url: 'setup/create-admin', // FIX: No leading slash
        method: 'POST',
        body: adminData,
      }),
    }),

    // Query to get today's report for an employee
    getTodaysReport: builder.query({
      query: (employeeId) => `reports/my-today/${employeeId}`, // FIX: No leading slash
      providesTags: (result, error, employeeId) => [
        { type: "Report", id: employeeId },
      ],
    }),

    getAllMyReports: builder.query({
      query: (employeeId) => `reports/my-all/${employeeId}`, // FIX: No leading slash
      providesTags: (result = [], error, arg) => [
        'Report',
        ...result.map(({ id }) => ({ type: 'Report', id })),
      ],
    }),

    // Admin endpoint to get reports for a specific employee
    getReportsByEmployee: builder.query({
      query: (employeeId) => `reports/employee/${employeeId}`, // FIX: No leading slash
      providesTags: (result, error, arg) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Report', id: _id })),
              { type: 'Report', id: 'LIST' },
            ]
          : [{ type: 'Report', id: 'LIST' }],
    }),
    // Mutation to update today's report
    updateTodaysReport: builder.mutation({
      query: ({ employeeId, ...patch }) => ({
        url: `reports/my-today/${employeeId}`, // FIX: No leading slash
        method: "POST",
        body: patch,
      }),
      invalidatesTags: (result, error, { employeeId }) => [
        { type: "Report", id: employeeId }, 'Task',
        { type: 'Report', id: 'LIST' }
      ],
    }),

    deleteReport: builder.mutation({
      query: (id) => ({
        url: `reports/${id}`, // FIX: No leading slash
        method: 'DELETE',
      }),
      invalidatesTags: ['Report'],
    }),

    // Notification endpoints
    getNotifications: builder.query({
      query: () => 'notifications', // FIX: No leading slash
      providesTags: ['Notification'],
      pollingInterval: 30000,
    }),

    markNotificationsAsRead: builder.mutation({
      query: () => ({
        url: 'notifications/mark-read', // FIX: No leading slash
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),

    deleteReadNotifications: builder.mutation({
      query: () => ({
        url: 'notifications/read', // FIX: No leading slash
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),

    // Holiday endpoints
    getHolidays: builder.query({
      query: () => 'holidays', // FIX: No leading slash
      providesTags: (result = []) => [
        ...result.map(({ _id }) => ({ type: 'Holiday', id: _id })),
        { type: 'Holiday', id: 'LIST' },
      ],
    }),

    addHoliday: builder.mutation({
      query: (holiday) => ({
        url: 'holidays', // FIX: No leading slash
        method: 'POST',
        body: holiday,
      }),
      invalidatesTags: [{ type: 'Holiday', id: 'LIST' }],
    }),

    deleteHoliday: builder.mutation({
      query: (id) => ({ url: `holidays/${id}`, method: 'DELETE' }), // FIX: No leading slash
      invalidatesTags: (result, error, id) => [{ type: 'Holiday', id }, { type: 'Holiday', id: 'LIST' }],
    }),

    // Leave endpoints
    getLeaves: builder.query({
      query: (employeeId) => `leaves/${employeeId}`, // FIX: No leading slash
      providesTags: (result = [], error, employeeId) => [
        ...result.map(({ _id }) => ({ type: 'Leave', id: _id })),
        { type: 'Leave', id: 'LIST', employeeId },
      ],
      pollingInterval: 30000,
    }),

    addLeave: builder.mutation({
      query: ({ employeeId, date }) => ({
        url: `leaves/${employeeId}`, // FIX: No leading slash
        method: 'POST',
        body: { date },
      }),
      invalidatesTags: (result, error, { employeeId }) => [{ type: 'Leave', id: 'LIST', employeeId }],
    }),

    removeLeave: builder.mutation({
      query: (leaveId) => ({ url: `leaves/${leaveId}`, method: 'DELETE' }), // FIX: No leading slash
      invalidatesTags: (result, error, leaveId) => [
        { type: 'Leave', id: leaveId }, { type: 'Leave', id: 'LIST' }
      ],
    }),

    // Attendance endpoint
    getAttendance: builder.query({
      query: ({ employeeId, year, month }) => `attendance/${employeeId}?year=${year}&month=${month}`, // FIX: No leading slash
      providesTags: ['Report', 'Leave', 'Holiday'],
    }),

    // Task endpoints
    createTask: builder.mutation({
      query: (taskData) => ({
        url: 'tasks', // FIX: No leading slash
        method: 'POST',
        body: taskData,
      }),
      invalidatesTags: ['Task'],
    }),

    getMyTasks: builder.query({
      query: () => 'tasks/my-tasks', // FIX: No leading slash
      providesTags: ['Task'],
      pollingInterval: 30000,
    }),

    getAllTasks: builder.query({
      query: () => 'tasks/all', // FIX: No leading slash
      providesTags: ['Task'],
      pollingInterval: 30000,
    }),

    updateTask: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `tasks/${id}`, // FIX: No leading slash
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => ['Task', { type: 'Employee', id: 'LIST' }, 'Notification'],
    }),

    approveTask: builder.mutation({
      query: ({ id, finalPercentage, comment }) => ({
        url: `tasks/${id}/approve`, // FIX: No leading slash
        method: 'PUT',
        body: { finalPercentage, comment },
      }),
      invalidatesTags: ['Task', 'Notification'],
    }),

    rejectTask: builder.mutation({
      query: ({ id, reason, finalPercentage }) => ({
        url: `tasks/${id}/reject`, // FIX: No leading slash
        method: 'PUT',
        body: { reason, finalPercentage },
      }),
      invalidatesTags: ['Task', 'Notification'],
    }),

    addTaskComment: builder.mutation({
      query: ({ taskId, text }) => ({
        url: `tasks/${taskId}/comments`, // FIX: No leading slash
        method: 'POST',
        body: { text },
      }),
      invalidatesTags: (result, error, { taskId }) => [{ type: 'Task', id: taskId }],
    }),

    deleteTask: builder.mutation({
      query: (id) => ({
        url: `tasks/${id}`, // FIX: No leading slash
        method: 'DELETE',
      }),
      invalidatesTags: ['Task'],
    }),
    processPastDueTasks: builder.mutation({
      query: () => ({
        url: 'tasks/process-due-tasks', // FIX: No leading slash
        method: 'POST',
      }),
      invalidatesTags: ['Task', 'Notification'],
    }),

    getEmployeeOfTheMonthCandidates: builder.query({
      query: ({ month, year }) => `employees/employee-of-the-month?month=${month}&year=${year}`, // FIX: No leading slash
      providesTags: (result, error, { month, year }) => [
        { type: 'Employee', id: `EOM-${month}-${year}` }
      ],
      pollingInterval: 30000,
    }),

    setEmployeeOfTheMonth: builder.mutation({
      query: (body) => ({
        url: 'employees/employee-of-the-month', // FIX: No leading slash
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { month, year }) => [
        { type: 'EOMOfficial', id: `${month}-${year}` },
        'Announcement',
      ],
    }),

    getOfficialEOM: builder.query({
      query: ({ month, year }) => `employees/official-eom?month=${month}&year=${year}`, // FIX: No leading slash
      providesTags: (result, error, { month, year }) => [{ type: 'EOMOfficial', id: `${month}-${year}` }],
      refetchOnMountOrArgChange: true,
      pollingInterval: 30000,
    }),

    getHallOfFame: builder.query({
      query: () => 'employees/hall-of-fame', // FIX: No leading slash
      providesTags: ['EOMOfficial'],
    }),

    getEmployeeEOMHistory: builder.query({
      query: (employeeId) => `employees/${employeeId}/eom-history`, // FIX: No leading slash
      providesTags: (result, error, employeeId) => [{ type: 'EOMHistory', id: employeeId }],
    }),

    // Announcement Endpoints
    getActiveAnnouncement: builder.query({
      query: () => 'announcements/active', // FIX: No leading slash
      providesTags: ['Announcement'],
      pollingInterval: 30000,
    }),

    getAllAnnouncements: builder.query({
      query: () => 'announcements', // FIX: No leading slash
      providesTags: (result = []) => [
        ...result.map(({ _id }) => ({ type: 'Announcement', id: _id })),
        { type: 'Announcement', id: 'LIST' },
      ],
    }),

    createAnnouncement: builder.mutation({
      query: (announcement) => ({
        url: 'announcements', // FIX: No leading slash
        method: 'POST',
        body: announcement,
      }),
      invalidatesTags: [{ type: 'Announcement', id: 'LIST' }, 'Announcement'],
    }),

    deleteAnnouncement: builder.mutation({
      query: (id) => ({ url: `announcements/${id}`, method: 'DELETE' }), // FIX: No leading slash
      invalidatesTags: (result, error, id) => [{ type: 'Announcement', id }, { type: 'Announcement', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetManagerDashboardStatsQuery,
  useGetEmployeesQuery,
  useAddEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useAssignEmployeeMutation,
  useUnassignEmployeeMutation,
  useGetTodaysReportQuery,
  useUpdateTodaysReportMutation,
  useLoginMutation,
  useGetAllMyReportsQuery,
  useGetReportsByEmployeeQuery,
  useDeleteReportMutation,
  useCheckAdminSetupQuery,
  useCreateAdminMutation,
  useGetNotificationsQuery,
  useMarkNotificationsAsReadMutation,
  useDeleteReadNotificationsMutation,
  useGetHolidaysQuery,
  useAddHolidayMutation,
  useDeleteHolidayMutation,
  useGetLeavesQuery,
  useAddLeaveMutation,
  useRemoveLeaveMutation,
  useGetAttendanceQuery,
  useGetMeQuery,
  useCreateTaskMutation,
  useGetMyTasksQuery,
  useGetAllTasksQuery,
  useUpdateTaskMutation,
  useApproveTaskMutation,
  useRejectTaskMutation,
  useAddTaskCommentMutation,
  useDeleteTaskMutation,
  useGetEmployeeOfTheMonthCandidatesQuery,
  useGetActiveAnnouncementQuery,
  useSetEmployeeOfTheMonthMutation,
  useGetOfficialEOMQuery,
  useGetHallOfFameQuery,
  useGetEmployeeEOMHistoryQuery,
  useGetAllAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useDeleteAnnouncementMutation,
} = employeApi;
export const { useProcessPastDueTasksMutation } = employeApi;
