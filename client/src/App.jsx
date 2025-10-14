import React from "react";
import { Routes, Route, Navigate } from 'react-router-dom'; 
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

// This component will act as a gatekeeper.
// If setup is needed, it redirects to /setup. Otherwise, it renders the main app.
const SetupGate = ({ children, setupNeeded }) => {
  const location = useLocation();

  if (setupNeeded) {
    // If setup is needed and we're not already on the setup page, redirect.
    if (location.pathname !== '/setup') {
      return <Navigate to="/setup" replace />;
    }
  }
  return children;
};

function App() {
  const user = useSelector(selectCurrentUser);
  const { data: setupData, isLoading, refetch } = useCheckAdminSetupQuery();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <InactivityDetector>
      <CurrentUserProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* The setup route is now always available */}
          <Route path="/setup" element={<AdminSetup onSetupComplete={refetch} />} />

          {/* All other routes are wrapped by the SetupGate */}
          <Route element={<SetupGate setupNeeded={setupData?.setupNeeded} />}>
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
            <Route path="/*" element={<Navigate to={!user ? "/login" : user.dashboardAccess === 'Admin Dashboard' ? "/admin-dashboard" : user.dashboardAccess === 'Manager Dashboard' ? '/manager-dashboard' : "/employee-dashboard"} />} />
          </Route>
        </Routes>
      </CurrentUserProvider>
    </InactivityDetector>
  );
}

export default App;
