import React, { useState, useEffect, useRef, useMemo } from "react";
import toast from "react-hot-toast";
import { ArrowPathIcon, UserIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../services/EmployeApi";
import { setCredentials } from "../app/authSlice";

const wishes = [
  "Let's make today productive!",
  "Ready to achieve great things?",
  "Your hard work makes a difference.",
  "Let's get started on a great day!",
  "Time to shine!",
  "Welcome! Let's make an impact."
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return "Good Morning";
  }
  if (hour >= 12 && hour < 18) {
    return "Good Afternoon";
  }
  return "Good Evening";
};

const Login = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const isMounted = useRef(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [wish, setWish] = useState('');

  useEffect(() => {
    setWish(wishes[Math.floor(Math.random() * wishes.length)]);
  }, []);

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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 relative overflow-hidden font-manrope">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
          .font-manrope {
            font-family: 'Manrope', sans-serif;
          }
        `}
      </style>
      {/* Animated background shapes */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob dark:opacity-20"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-2000 dark:opacity-20"></div>
      <div className="absolute -bottom-10 -left-20 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-4000 dark:opacity-20"></div>

      <div className="relative w-full max-w-md">
        {/* Animated gradient border */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-indigo-400 via-blue-400 to-purple-400 animate-pulse-slow opacity-20 blur-xl"></div>
        {/* Floating glassmorphism card */}
        <div className="relative z-10 w-full p-8 sm:p-10 space-y-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 transition-transform duration-300 hover:-translate-y-1 hover:shadow-3xl">
          <div className="text-center">
            <div className="mx-auto mb-4 flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 dark:from-blue-900/50 dark:via-indigo-900/50 dark:to-purple-900/50 shadow-lg ring-4 ring-white/20 animate-bounce-slow">
              <img src="/assets/fevicon.png" alt="Logo" className="h-12 w-12" />
            </div>
            <h1 className="text-4xl font-extrabold text-indigo-700 dark:text-indigo-300 drop-shadow-md mb-2 tracking-tight animate-fade-in">
              {getGreeting()}!
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base mb-2 animate-fade-in">{wish}</p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="employeeId" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Employee ID
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <UserIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="employeeId"
                  name="employeeId"
                  type="text"
                  autoComplete="employeeId"
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 transition-all duration-200"
                  placeholder="ST-001"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <LockClosedIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 transition-all duration-200"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex justify-center py-3 px-4 rounded-xl shadow-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
              >
                {isLoading && <ArrowPathIcon className="animate-spin h-5 w-5 mr-3" />}
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </div>
          </form>
          <div className="text-center text-xs text-slate-400 dark:text-slate-500 mt-2">
            &copy; {new Date().getFullYear()} StarTrack Portal
          </div>
        </div>
      </div>
      {/* Custom animations */}
      <style>
        {`
          @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
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