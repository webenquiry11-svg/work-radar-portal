import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLogoutMutation } from '../services/apiSlice';
import toast from 'react-hot-toast';
import { selectCurrentUser } from './authSlice';

const InactivityDetector = ({ children }) => {
  const dispatch = useDispatch();
  const [logout] = useLogoutMutation();
  const user = useSelector(selectCurrentUser);
  const timeoutRef = useRef(null);

  const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

  const handleLogout = () => {
    logout();
    toast('You have been logged out due to inactivity.', { icon: '👋' });
  };

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(handleLogout, INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    if (!user) {
      // If there's no user, no need for the detector
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    const events = ['mousemove', 'keydown', 'click', 'scroll'];

    const eventHandler = () => resetTimeout();

    events.forEach(event => window.addEventListener(event, eventHandler));
    resetTimeout(); // Start the timer initially

    return () => {
      events.forEach(event => window.removeEventListener(event, eventHandler));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [user]); // Rerun effect if user logs in or out

  return <>{children}</>;
};

export default InactivityDetector;