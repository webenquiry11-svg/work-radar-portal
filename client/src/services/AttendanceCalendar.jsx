import React, { useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useGetAttendanceQuery } from '../services/EmployeApi';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const AttendanceCalendar = ({ employeeId }) => {
  const [activeStartDate, setActiveStartDate] = useState(new Date());

  const year = activeStartDate.getUTCFullYear();
  const month = activeStartDate.getUTCMonth() + 1;

  const { data: attendanceData = [], isLoading } = useGetAttendanceQuery(
    { employeeId, year, month },
    { skip: !employeeId }
  );

  const attendanceMap = useMemo(() => {
    const map = new Map();
    attendanceData.forEach(item => {
      map.set(item.date, item.status);
    });
    return map;
  }, [attendanceData]);

  const statusStyles = {
    Present: 'bg-green-100 text-green-800',
    Absent: 'bg-red-100 text-red-800',
    'On Leave': 'bg-yellow-100 text-yellow-800',
    Holiday: 'holiday-gradient text-white',
    Future: 'bg-white',
    Pending: 'bg-gray-200 text-gray-600',
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      // The calendar passes local time dates, we need to find the status for the corresponding UTC date string.
      const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const status = attendanceMap.get(utcDate.toISOString().split('T')[0]);
      if (status && status !== 'Future') {
        return (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-full px-1 text-center">
            <p className={`rounded-full text-[9px] font-bold truncate leading-tight ${statusStyles[status]}`}>
              {status}
            </p>
          </div>
        );
      }
    }
    return null;
  };

  const Legend = () => (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 text-xs">
      {Object.entries(statusStyles).filter(([key]) => !['Future', 'Pending', 'Weekend'].includes(key)).map(([status, className]) => (
        <div key={status} className="flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${className.split(' ')[0]}`}></span>
          <span>{status}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <style>{`
        .attendance-calendar .react-calendar {
          width: 100%; border: none; border-radius: 1rem;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
          padding: 1.5rem; background: white;
        }
        .attendance-calendar .react-calendar__tile {
          border-radius: 0.5rem; position: relative; height: 80px;
        }
        .attendance-calendar .react-calendar__navigation button {
          font-weight: bold; font-size: 1.1rem;
        }
        .attendance-calendar .react-calendar__navigation__arrow {
          font-size: 1.5rem;
        }
        .holiday-gradient {
          background-image: linear-gradient(to right, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6);
        }
      `}</style>
      <div className="attendance-calendar">
        {isLoading && <div className="text-center p-4">Loading attendance...</div>}
        <Calendar
          activeStartDate={activeStartDate}
          onActiveStartDateChange={({ activeStartDate }) => {
            // Ensure the new start date is also treated as UTC midnight
            setActiveStartDate(new Date(Date.UTC(activeStartDate.getFullYear(), activeStartDate.getMonth(), 1)));
          }}
          value={new Date()}
          tileContent={tileContent}
          showNeighboringMonth={false}
          prev2Label={null}
          next2Label={null}
          prevLabel={<ChevronLeftIcon className="h-6 w-6" />}
          nextLabel={<ChevronRightIcon className="h-6 w-6" />}
        />
        <Legend />
      </div>
    </div>
  );
};

export default AttendanceCalendar;