import React from "react";
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'; 
import { useSelector } from 'react-redux';
import AdminDashboard from "./Admin/AdminDashboard";
import { Toaster } from "react-hot-toast";
import Login from "./Form/Login";
import { selectCurrentUser } from "./app/authSlice";
import EmployeeDashboard from "./Employee/EmployeDashboard";
import ManagerDashboard from "./Senior/ManagerDashboard"; 
import CurrentUserProvider from "./app/CurrentUserProvider";
import { useCheckAdminSetupQuery } from "./services/EmployeApi";
import AdminSetup from "./Form/AdminSetup";
import InactivityDetector from "./app/InactivityDetector";

// A new component to handle the "setup needed" logic
function SetupGuard({ children }) {
  const { data: setupData, isLoading } = useCheckAdminSetupQuery();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading Setup Status...</div>;
  }

  // If setup is needed, and we are NOT already on the setup page, redirect there.
  if (setupData?.setupNeeded && location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />;
  }

  // If setup is NOT needed, but we are trying to access the setup page, redirect to login.
  if (!setupData?.setupNeeded && location.pathname === '/setup') {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, render the requested page (the rest of the app)
  return children;
}


function App() {
  const user = useSelector(selectCurrentUser);
  const { refetch } = useCheckAdminSetupQuery();

  return (
    <InactivityDetector>
      <CurrentUserProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* The setup route is always available */}
          <Route path="/setup" element={<AdminSetup onSetupComplete={refetch} />} />
          
          {/* All other routes are protected by the SetupGuard */}
          <Route path="/*" element={
            <SetupGuard>
              <Routes>
                <Route path="/login" element={!user ? <Login /> : <Navigate to={
                  user.dashboardAccess === 'Admin Dashboard' ? '/admin-dashboard' :
                  user.dashboardAccess === 'Manager Dashboard' ? '/manager-dashboard' :
                  '/employee-dashboard'
                } />} />
                <Route
                  path="/employee-dashboard"
                  element={user && user.dashboardAccess === 'Employee Dashboard' ? <EmployeeDashboard employeeId={user._id} /> : <Navigate to="/login" />}
                />
                <Route
                  path="/manager-dashboard"
                  element={user && user.dashboardAccess === 'Manager Dashboard' ? <ManagerDashboard /> : <Navigate to="/login" />}
                />
                <Route
                  path="/admin-dashboard"
                  element={user && user.dashboardAccess === 'Admin Dashboard' ? <AdminDashboard /> : <Navigate to="/login" />}
                />
                {/* Fallback redirect for any other authenticated paths */}
                <Route 
                  path="/*" 
                  element={<Navigate to={!user ? "/login" : user.dashboardAccess === 'Admin Dashboard' ? "/admin-dashboard" : user.dashboardAccess === 'Manager Dashboard' ? '/manager-dashboard' : "/employee-dashboard"} />} 
                />
              </Routes>
            </SetupGuard>
          } />
        </Routes>
      </CurrentUserProvider>
    </InactivityDetector>
  );
}

export default App;