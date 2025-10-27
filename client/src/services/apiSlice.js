// src/services/apiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
 
const baseQuery = fetchBaseQuery({
  baseUrl: '/workradar/api',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If a request fails with a 401 Unauthorized or 403 Forbidden,
  // it means the token is invalid or expired.
  // We dispatch the logOut action to reset the client-side auth state for 401 errors.
  if (result.error && result.error.status === 401) {
    console.error('API Error:', result.error);
    // Dispatching a logout action will clear the user's session.
    // This is a "hard" logout for invalid tokens.
    // Note: This will cause a full page reload if your routing is set up to redirect on logout.
    api.dispatch({ type: 'auth/logOut' });
    // We could also try to re-authenticate here with a refresh token if we had one.
  }

  return result;
};

// Define a core service using a base URL - other API slices will inject endpoints
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Employee', 'Report', 'User'], // Define tag types for caching
  endpoints: (builder) => ({
    logout: builder.mutation({
      // The query is intentionally empty because we are just using this to trigger the onQueryStarted logic.
      query: () => ({ url: '/logout', method: 'POST' }), // This can be a dummy endpoint
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        dispatch({ type: 'auth/logOut' });
        // Reset the entire API state to clear out any cached data
        dispatch(apiSlice.util.resetApiState());
      },
    }),
  }), // Endpoints are injected from other files
});

// Export the auto-generated hook for the logout mutation
export const { useLogoutMutation } = apiSlice;