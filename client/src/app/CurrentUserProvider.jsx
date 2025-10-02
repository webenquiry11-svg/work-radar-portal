import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetMeQuery } from '../services/EmployeApi';
import { setCredentials } from './authSlice';

const CurrentUserProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  
  // Fetch user data if a token exists
  const { data: user, isLoading } = useGetMeQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    // When the user data is fetched successfully, update the credentials in the store.
    // This ensures the local state always has the latest permissions from the server.
    if (user) {
      dispatch(setCredentials({ user, token }));
    }
  }, [user, token, dispatch]);

  return <>{children}</>;
};

export default CurrentUserProvider;