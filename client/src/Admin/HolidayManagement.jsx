import React, { useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useGetHolidaysQuery, useAddHolidayMutation, useDeleteHolidayMutation } from '../services/EmployeApi';
import toast from 'react-hot-toast';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const HolidayManagement = () => {
  const [date, setDate] = useState(new Date());
  const { data: holidays = [], isLoading } = useGetHolidaysQuery();
  const [addHoliday, { isLoading: isAdding }] = useAddHolidayMutation();
  const [deleteHoliday, { isLoading: isDeleting }] = useDeleteHolidayMutation();

  const holidayDates = useMemo(() => {
    const dateMap = new Map();
    holidays.forEach(h => {
      // Use UTC date string as the key to avoid timezone issues
      const utcDate = new Date(h.date);
      const utcDateString = new Date(Date.UTC(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate())).toDateString();
      dateMap.set(utcDateString, h);
    });
    return dateMap;
  }, [holidays]);

  const handleDateClick = async (value) => {
    // `value` from react-calendar is a local date. We need its UTC equivalent string.
    const dateString = new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate())).toDateString();

    if (value.getDay() === 0) {
      toast.error("Sunday is a permanent holiday and cannot be modified.");
      return;
    }

    const existingHoliday = holidayDates.get(dateString);

    if (existingHoliday) {
      // If it's already a holiday, confirm deletion
      if (window.confirm(`Are you sure you want to remove "${existingHoliday.name}" as a holiday?`)) {
        try {
          await deleteHoliday(existingHoliday._id).unwrap();
          toast.success('Holiday removed successfully!');
        } catch (err) {
          toast.error('Failed to remove holiday.');
        }
      }
    } else {
      // If it's not a holiday, prompt for a name and add it
      const holidayName = window.prompt('Enter the name for this holiday:');
      if (holidayName) {
        try {
          await addHoliday({ date: value.toISOString(), name: holidayName }).unwrap();
          toast.success('Holiday added successfully!');
        } catch (err) {
          toast.error(err.data?.message || 'Failed to add holiday.');
        }
      }
    }
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const utcDateString = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toDateString();
      const holiday = holidayDates.get(utcDateString);
      if (holiday) {
        return (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-full px-1 text-center">
            <p className="text-white bg-red-500 rounded-full text-[8px] font-bold truncate leading-tight">
              {holiday.name}
            </p>
          </div>
        );
      }
    }
    return null;
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const utcDateString = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toDateString();
      if (date.getDay() === 0) {
        return 'sunday-tile';
      }
      if (holidayDates.has(utcDateString)) {
        return 'holiday-tile';
      }
    }
    return null;
  };

  const tileDisabled = ({ date, view }) => {
    // Disable Sundays in month view
    return view === 'month' && date.getDay() === 0;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full">
      <style>{`
        .react-calendar {
          width: 100%;
          border: none;
          border-radius: 1rem;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
          padding: 1.5rem;
          background: white;
        }
        .react-calendar__tile {
          border-radius: 0.5rem;
          position: relative;
        }
        .react-calendar__tile--now {
          background: #e0e7ff;
        }
        .react-calendar__tile:enabled:hover,
        .react-calendar__tile:enabled:focus {
          background-color: #c7d2fe;
        }
        .holiday-tile {
          background-color: #fecaca !important;
          color: #b91c1c;
          font-weight: bold;
        }
        .sunday-tile {
          background-color: #fee2e2 !important;
          color: #991b1b;
        }
      `}</style>
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm h-full flex flex-col p-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-slate-800">Holiday Management</h3>
          <p className="text-sm text-slate-500 mt-1">Click on a date to add or remove a holiday.</p>
        </div>
        {isLoading ? (
          <p>Loading holidays...</p>
        ) : (
          <Calendar
            onChange={setDate}
            value={date}
            onClickDay={handleDateClick}
            tileContent={tileContent}
            tileClassName={tileClassName}
            tileDisabled={tileDisabled}
          />
        )}
      </div>
    </div>
  );
};

export default HolidayManagement;