import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../services/EmployeApi";
import starPublicityLogo from '../assets/fevicon.png';
import { setCredentials } from "../app/authSlice";

const Login = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const isMounted = useRef(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employeeId || !password) {
      toast.error("Please enter both employee ID and password.");
      return;
    }

    try {
      const userData = await login({ employeeId, password }).unwrap();
      dispatch(setCredentials(userData));
      toast.success(`Welcome back, ${userData.user.name}!`);

      const dashboard = userData.user?.dashboardAccess || 'Employee Dashboard';
      if (dashboard === 'Admin Dashboard') {
        navigate('/admin-dashboard');
      } else if (dashboard === 'Manager Dashboard') {
        navigate('/manager-dashboard');
      } else {
        navigate('/employee-dashboard');
      }
    } catch (err) {
      if (err && err.status === 401) {
        toast.error('Invalid credentials. Please check your ID and password.');
      } else {
        toast.error(err.data?.message || 'Login failed. Please try again.');
      }
      console.error("Failed to login:", err);
    } finally {
      // No need to manage isLoading manually, the hook does it.
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-300 via-blue-200 to-blue-400 relative overflow-hidden font-manrope">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
          .font-manrope {
            font-family: 'Manrope', sans-serif;
          }
        `}
      </style>
      {/* Blurred SVG background shape */}
      <svg
        className="absolute -top-32 -left-32 w-[600px] h-[600px] opacity-30 blur-2xl pointer-events-none"
        viewBox="0 0 600 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="300" cy="300" r="300" fill="url(#paint0_radial)" />
        <defs>
          <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientTransform="translate(300 300) scale(300)">
            <stop stopColor="#6366F1" />
            <stop offset="1" stopColor="#38BDF8" />
          </radialGradient>
        </defs>
      </svg>
      <div className="relative w-full max-w-md">
        {/* Animated gradient border */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500 via-blue-400 to-blue-600 animate-pulse opacity-40 blur-lg"></div>
        {/* Floating glassmorphism card */}
        <div className="relative z-10 w-full p-10 space-y-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-blue-300/30 transition-transform duration-300 hover:-translate-y-1 hover:shadow-3xl">
          <div className="text-center">
            <div className="mx-auto mb-4 flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-blue-200 via-indigo-200 to-blue-300 shadow-lg ring-4 ring-blue-300/30 animate-bounce-slow">
              <img src={starPublicityLogo} alt="Logo" className="h-12 w-12" />
            </div>
            <h1 className="text-4xl font-extrabold text-indigo-700 drop-shadow mb-2 tracking-tight animate-fade-in">
              Welcome Back
            </h1>
            <p className="text-blue-500 text-base mb-2 animate-fade-in">Sign in to your Report Portal</p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="employeeId" className="text-sm font-semibold text-indigo-700">
                Employee ID
              </label>
              <input
                id="employeeId"
                name="employeeId"
                type="text"
                autoComplete="employeeId"
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-indigo-200 rounded-lg shadow-sm placeholder-indigo-300 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-indigo-400 bg-white/95 text-indigo-900 transition-all duration-200"
                placeholder="ST-001"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-semibold text-indigo-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-indigo-200 rounded-lg shadow-sm placeholder-indigo-300 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-indigo-400 bg-white/95 text-indigo-900 transition-all duration-200"
                placeholder="••••••••"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex justify-center py-2 px-4 rounded-xl shadow font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 disabled:bg-indigo-300 transition-all duration-200"
              >
                {isLoading && <ArrowPathIcon className="animate-spin h-5 w-5 mr-3" />}
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </div>
          </form>
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-indigo-100"></div>
            <span className="mx-2 text-xs text-indigo-300">or</span>
            <div className="flex-grow border-t border-indigo-100"></div>
          </div>
          <div className="text-center text-xs text-indigo-400 mt-2">
            &copy; {new Date().getFullYear()} StarTrack Portal
          </div>
        </div>
      </div>
      {/* Custom animations */}
      <style>
        {`
          .animate-bounce-slow {
            animation: bounce 2.5s infinite;
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0);}
            50% { transform: translateY(-10px);}
          }
          .animate-fade-in {
            animation: fadeIn 1.2s ease;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px);}
            to { opacity: 1; transform: translateY(0);}
          }
          .hover\\:shadow-3xl:hover {
            box-shadow: 0 12px 32px 0 rgba(59,130,246,0.25), 0 1.5px 6px 0 rgba(99,102,241,0.10);
          }
        `}
      </style>
    </div>
  );
};

export default Login;