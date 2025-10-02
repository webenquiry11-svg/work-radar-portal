import { apiSlice } from "./apiSlice";
import { setCredentials } from "../app/authSlice";

export const employeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Query to get dashboard stats
    getDashboardStats: builder.query({
      query: () => "/stats",
      providesTags: (result, error, arg) => [{ type: "Employee", id: "LIST" }],
    }),
    // Query to get manager dashboard stats
    getManagerDashboardStats: builder.query({
      query: (managerId) => `/manager-stats/${managerId}`,
      providesTags: ["Report", { type: "Employee", id: "LIST" }],
    }),
    // Query to get all employees
    getEmployees: builder.query({
      query: () => "/employees",
      // Provides a tag for the list of employees.
      // This is used for caching and automatic re-fetching.
      providesTags: (result = []) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: "Employee", id: _id })),
              { type: "Employee", id: "LIST" },
            ]
          : [{ type: "Employee", id: "LIST" }],
    }),

    // Mutation to add a new employee
    addEmployee: builder.mutation({
      query: (newEmployee) => ({
        url: "/employees",
        method: "POST",
        body: newEmployee, // Body is now FormData
      }),
      // When an employee is added, invalidate the 'Employee' list tag to trigger a refetch.
      invalidatesTags: [{ type: "Employee", id: "LIST" }],
    }),
    // Mutation to update an employee
    updateEmployee: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/employees/${id}`,
        method: "PUT",
        body: formData, // Body is now FormData
      }),
      // Invalidates the 'Employee' list tag to trigger a refetch.
      invalidatesTags: (result, error, { id }) => [
        { type: "Employee", id },
        { type: "Employee", id: "LIST" }
      ],
      async onQueryStarted({ id }, { dispatch, queryFulfilled, getState }) {
        try {
          const { data: updatedData } = await queryFulfilled;
          const loggedInUser = getState().auth.user;
          const token = getState().auth.token;

          // If the updated employee is the currently logged-in user,
          // update their credentials in the Redux store to reflect permission changes instantly.
          if (loggedInUser && loggedInUser._id === id && updatedData.employee) {
            dispatch(setCredentials({ user: updatedData.employee, token }));
          }
        } catch (err) { /* The error is already handled by the component */ }
      },
    }),
    // Mutation to delete an employee
    deleteEmployee: builder.mutation({
      query: (id) => ({
        url: `/employees/${id}`,
        method: "DELETE",
      }),
      // Invalidates the 'Employee' list tag to trigger a refetch.
      invalidatesTags: (result, error, id) => [{ type: "Employee", id }],
    }),
    // Mutation to assign an employee
    assignEmployee: builder.mutation({
      query: ({ employeeId, department, teamLeadId }) => ({
        url: `/employees/${employeeId}/assign`,
        method: "PUT",
        body: { department, teamLeadId },
      }),
      invalidatesTags: (result, error, { employeeId, teamLeadId }) => [
        { type: "Employee", id: employeeId },
        { type: "Employee", id: teamLeadId },
        { type: "Employee", id: "LIST" },
        'User', // Invalidate the general User tag to force refetch of 'getMe'
      ],
    }),
    // Mutation to unassign an employee
    unassignEmployee: builder.mutation({
      query: (employeeId) => ({
        url: `/employees/${employeeId}/unassign`,
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
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['User'],
      // Automatically refetch the user's data every 30 seconds
      // to ensure permissions are always up-to-date.
      pollingInterval: 30000, 
    }),
    
    // Setup endpoints
    checkAdminSetup: builder.query({
      query: () => '/setup/check',
    }),

    createAdmin: builder.mutation({
      query: (adminData) => ({
        url: '/setup/create-admin',
        method: 'POST',
        body: adminData,
      }),
    }),

    // Query to get today's report for an employee
    getTodaysReport: builder.query({
      query: (employeeId) => `/reports/my-today/${employeeId}`,
      providesTags: (result, error, employeeId) => [
        { type: "Report", id: employeeId },
      ],
    }),

    getAllMyReports: builder.query({
      query: (employeeId) => `/reports/my-all/${employeeId}`,
      providesTags: (result = [], error, arg) => [
        'Report',
        ...result.map(({ id }) => ({ type: 'Report', id })),
      ],
    }),

    // Admin endpoint to get reports for a specific employee
    getReportsByEmployee: builder.query({
      query: (employeeId) => `/reports/employee/${employeeId}`,
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
        url: `/reports/my-today/${employeeId}`,
        method: "POST",
        body: patch,
      }),
      invalidatesTags: (result, error, { employeeId }) => [
        { type: "Report", id: employeeId },
        { type: 'Report', id: 'LIST' } // Invalidate the list to refetch past reports
      ],
    }),

    deleteReport: builder.mutation({
      query: (id) => ({
        url: `/reports/${id}`,
        method: 'DELETE',
      }),
      // Invalidate the general 'Report' tag to force a refetch of any queries that provide it.
      invalidatesTags: ['Report'],
    }),


    // Notification endpoints
    getNotifications: builder.query({
      query: () => '/notifications',
      providesTags: ['Notification'],
    }),

    markNotificationsAsRead: builder.mutation({
      query: () => ({
        url: '/notifications/mark-read',
        method: 'PUT',
      }),
      // When notifications are marked as read, invalidate the 'Notification' tag to refetch.
      invalidatesTags: ['Notification'],
    }),

    deleteReadNotifications: builder.mutation({
      query: () => ({
        url: '/notifications/read',
        method: 'DELETE',
      }),
      // When read notifications are deleted, invalidate the 'Notification' tag to refetch.
      invalidatesTags: ['Notification'],
    }),

    // Holiday endpoints
    getHolidays: builder.query({
      query: () => '/holidays',
      providesTags: (result = []) => [
        ...result.map(({ _id }) => ({ type: 'Holiday', id: _id })),
        { type: 'Holiday', id: 'LIST' },
      ],
    }),

    addHoliday: builder.mutation({
      query: (holiday) => ({
        url: '/holidays',
        method: 'POST',
        body: holiday,
      }),
      invalidatesTags: [{ type: 'Holiday', id: 'LIST' }],
    }),

    deleteHoliday: builder.mutation({
      query: (id) => ({ url: `/holidays/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [{ type: 'Holiday', id }, { type: 'Holiday', id: 'LIST' }],
    }),

    // Leave endpoints
    getLeaves: builder.query({
      query: (employeeId) => `/leaves/${employeeId}`,
      providesTags: (result = [], error, employeeId) => [
        ...result.map(({ _id }) => ({ type: 'Leave', id: _id })),
        { type: 'Leave', id: 'LIST', employeeId },
      ],
    }),

    addLeave: builder.mutation({
      query: ({ employeeId, date }) => ({
        url: `/leaves/${employeeId}`,
        method: 'POST',
        body: { date },
      }),
      invalidatesTags: (result, error, { employeeId }) => [{ type: 'Leave', id: 'LIST', employeeId }],
    }),

    removeLeave: builder.mutation({
      query: (leaveId) => ({ url: `/leaves/${leaveId}`, method: 'DELETE' }),
      invalidatesTags: (result, error, leaveId) => [{ type: 'Leave', id: leaveId }],
    }),

    // Attendance endpoint
    getAttendance: builder.query({
      query: ({ employeeId, year, month }) => `/attendance/${employeeId}?year=${year}&month=${month}`,
      providesTags: ['Report', 'Leave', 'Holiday'],
    }),

    // Task endpoints
    createTask: builder.mutation({
      query: (taskData) => ({
        url: '/tasks',
        method: 'POST',
        body: taskData,
      }),
      invalidatesTags: ['Task'],
    }),

    getMyTasks: builder.query({
      query: () => '/tasks/my-tasks',
      providesTags: ['Task'],
    }),

    getAllTasks: builder.query({
      query: () => '/tasks/all',
      providesTags: ['Task'],
    }),

    updateTask: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/tasks/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => ['Task'],
    }),

    approveTask: builder.mutation({
      query: (id) => ({
        url: `/tasks/${id}/approve`,
        method: 'PUT',
      }),
      invalidatesTags: ['Task', 'Notification'],
    }),

    rejectTask: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/tasks/${id}/reject`,
        method: 'PUT',
        body: { reason },
      }),
      invalidatesTags: ['Task', 'Notification'],
    }),

    addTaskComment: builder.mutation({
      query: ({ taskId, text }) => ({
        url: `/tasks/${taskId}/comments`,
        method: 'POST',
        body: { text },
      }),
      invalidatesTags: (result, error, { taskId }) => [{ type: 'Task', id: taskId }],
    }),

    deleteTask: builder.mutation({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Task'],
    }),
    processPastDueTasks: builder.mutation({
      query: () => ({
        url: '/tasks/process-due-tasks',
        method: 'POST',
      }),
      invalidatesTags: ['Task', 'Notification'],
    }),

    getEmployeeOfTheMonthCandidates: builder.query({
      query: ({ month, year }) => `/employees/employee-of-the-month?month=${month}&year=${year}`,
      providesTags: (result, error, { month, year }) => [
        { type: 'Employee', id: `EOM-${month}-${year}` }
      ],
    }),

  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
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
} = employeApi;
export const { useProcessPastDueTasksMutation } = employeApi;
