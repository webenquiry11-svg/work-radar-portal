import React, { useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useLogoutMutation } from '../services/apiSlice';
import toast from 'react-hot-toast';
import { selectCurrentUser } from './authSlice';

const InactivityDetector = ({ children }) => {
  const [logout] = useLogoutMutation();
  const user = useSelector(selectCurrentUser);
  const timeoutRef = useRef(null);

  const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 60 minutes

  const handleLogout = useCallback(() => {
    logout();
    toast('You have been logged out due to inactivity.', { icon: '👋' });
  }, [logout]);

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
  }, [user, handleLogout]); // Rerun effect if user logs in or out

  return <>{children}</>;
};

export default InactivityDetector;