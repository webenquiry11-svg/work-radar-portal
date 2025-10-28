import { createSlice } from '@reduxjs/toolkit';
import { apiSlice } from '../services/apiSlice';

// Attempt to load user from localStorage
const storedAuthData = localStorage.getItem('user');
const authData = storedAuthData ? JSON.parse(storedAuthData) : null;

const initialState = {
  user: authData ? authData.user : null,
  token: authData ? authData.token : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      // Also save to localStorage
      localStorage.setItem('user', JSON.stringify({ user, token }));
    },
    logOut(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('user');
    }
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      authApi.endpoints.forgotPassword.matchFulfilled,
      (state, { payload }) => {
        // You can optionally handle state changes here upon success
      }
    )
  }
});

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    forgotPassword: builder.mutation({
      query: (credentials) => ({ url: 'auth/forgot-password', method: 'POST', body: credentials }),
    }),
  }),
});
export const { setCredentials, logOut } = authSlice.actions

export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;