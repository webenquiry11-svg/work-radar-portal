import React from "react";
// Remove "BrowserRouter as Router" from the import
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; 
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

const basename = import.meta.env.MODE === 'production' ? '/workradar' : '/';

function App() {
  const user = useSelector(selectCurrentUser);
  const { data: setupData, isLoading, refetch } = useCheckAdminSetupQuery();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (setupData?.setupNeeded) {
    return <AdminSetup onSetupComplete={refetch} />;
  }

  return (
    <BrowserRouter basename={basename}>
      <InactivityDetector>
        <CurrentUserProvider>
          <Toaster position="top-right" />
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
            <Route 
              path="/*" 
              element={<Navigate to={!user ? "/login" : user.dashboardAccess === 'Admin Dashboard' ? "/admin-dashboard" : user.dashboardAccess === 'Manager Dashboard' ? '/manager-dashboard' : "/employee-dashboard"} />} 
            />
          </Routes>
        </CurrentUserProvider>
      </InactivityDetector>
    </BrowserRouter>
  );
}

export default App;