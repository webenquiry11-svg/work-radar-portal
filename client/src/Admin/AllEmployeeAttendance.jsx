import React, { useState, useMemo, useEffect } from 'react';
import { useGetEmployeesQuery } from '../services/EmployeApi';
import AttendanceCalendar from '../services/AttendanceCalendar';
import { UserGroupIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const AllEmployeeAttendance = () => {
  const { data: allEmployees = [], isLoading: isLoadingEmployees } = useGetEmployeesQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return allEmployees;
    return allEmployees.filter(emp =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.employeeId && emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [allEmployees, searchTerm]);

  useEffect(() => {
    if (filteredEmployees.length > 0 && !selectedEmployee) {
      setSelectedEmployee(filteredEmployees[0]);
    } else if (filteredEmployees.length === 0) {
      setSelectedEmployee(null);
    }
  }, [filteredEmployees, selectedEmployee]);

  if (isLoadingEmployees) {
    return <div className="p-8 text-center">Loading employee data...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col bg-slate-50/50 dark:bg-black font-manrope">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">All Employee Attendance</h1>
        <p className="text-slate-500 dark:text-white mt-2">View attendance records for all employees in the organization.</p>
      </div>
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-6 md:gap-8">
        <div className="xl:col-span-1 bg-white dark:bg-black rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Employees ({filteredEmployees.length})</h2>
            <div className="relative mt-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 w-full text-sm border-slate-300 dark:border-slate-600 rounded-lg p-2 focus:ring-blue-500 bg-white dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {filteredEmployees.map(employee => (
              <button
                key={employee._id}
                onClick={() => setSelectedEmployee(employee)}
                className={`w-full text-left p-3 my-1 rounded-lg transition-all flex items-center gap-3 ${selectedEmployee?._id === employee._id ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-slate-100 dark:hover:bg-slate-900'}`}
              >
                <img src={employee.profilePicture || `https://ui-avatars.com/api/?name=${employee.name}&background=random`} alt={employee.name} className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <p className={`font-semibold ${selectedEmployee?._id === employee._id ? 'text-blue-800 dark:text-blue-300' : 'text-slate-800 dark:text-white'}`}>{employee.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{employee.role}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="xl:col-span-3">
          {selectedEmployee ? (
            <div className="bg-white dark:bg-black rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg p-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                <img src={selectedEmployee.profilePicture || `https://ui-avatars.com/api/?name=${selectedEmployee.name}&background=random`} alt={selectedEmployee.name} className="h-20 w-20 rounded-full object-cover" />
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{selectedEmployee.name}</h3>
                  <p className="text-slate-500 dark:text-slate-300">{selectedEmployee.role} &middot; {selectedEmployee.department}</p>
                  <p className="text-sm text-slate-400 font-mono">{selectedEmployee.employeeId}</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Attendance Calendar</h3>
              <AttendanceCalendar employeeId={selectedEmployee._id} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-white bg-white dark:bg-black rounded-2xl border-2 border-dashed p-8">
              <UserGroupIcon className="h-16 w-16 text-slate-400 mb-4" />
              <p className="font-semibold">No Employees Found</p>
              <p className="text-sm">There are no employees to display.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllEmployeeAttendance;