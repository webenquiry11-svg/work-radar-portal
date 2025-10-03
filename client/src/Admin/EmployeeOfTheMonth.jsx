import React, { useState, useMemo } from 'react';
import { useGetEmployeeOfTheMonthCandidatesQuery } from '../services/EmployeApi.js';
import { TrophyIcon, UserCircleIcon, ChartBarIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const EmployeeOfTheMonth = () => {
  const currentMonth = new Date().getMonth() + 1; // 1-indexed
  const currentYear = new Date().getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { data: candidates = [], isLoading, isFetching } = useGetEmployeeOfTheMonthCandidatesQuery(
    { month: selectedMonth, year: selectedYear },
    { refetchOnMountOrArgChange: true }
  );

  const years = useMemo(() => {
    const y = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
      y.push(i);
    }
    return y;
  }, [currentYear]);

  const months = useMemo(() => [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' },
  ], []);

  const GRADE_COLORS = {
    Completed: '#10B981', // Emerald
    Moderate: '#3B82F6', // Blue
    Low: '#F59E0B',      // Amber
    Pending: '#EF4444',   // Red
  };

  const handleExport = () => {
    if (candidates.length === 0) {
      toast.error("No data to export.");
      return;
    }

    const csvContent = [
      "Rank,Employee Name,Employee ID,Total Score,Total Tasks,Completed,Moderate,Low,Pending",
      ...candidates.map((c, index) => 
        [
          index + 1,
          `"${c.employee.name}"`,
          c.employee.employeeId,
          c.totalScore,
          c.totalTasks,
          c.stats.Completed.count, 
          c.stats.Moderate.count, 
          c.stats.Low.count, 
          c.stats.Pending.count
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Employee_of_the_Month_${selectedYear}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const CandidateCard = ({ candidate, rank, isWinner }) => {
    const chartData = Object.entries(candidate.stats).map(([name, { count, percentage = 0 }]) => ({
      name,
      count: count,
      label: `${name} (${percentage.toFixed(0)}%)`,
      color: GRADE_COLORS[name],
    })).filter(d => d.count > 0);

    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-slate-200 p-6 flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${isWinner ? 'lg:col-span-2' : ''}`}>
        <div className={`flex flex-col ${isWinner ? 'sm:flex-row' : ''} items-center gap-5 mb-5`}>
          <div className={`relative flex-shrink-0 ${isWinner ? 'self-start' : ''}`}>
            <img
              src={candidate.employee.profilePicture || `https://ui-avatars.com/api/?name=${candidate.employee.name}&background=random`}
              alt={candidate.employee.name}
              className={`${isWinner ? 'h-24 w-24' : 'h-20 w-20'} rounded-full object-cover border-4 ${isWinner ? 'border-amber-400' : 'border-blue-200'}`}
            />
            <span className={`absolute -top-2 -left-2 ${isWinner ? 'bg-amber-500' : 'bg-blue-600'} text-white text-sm font-bold px-3 py-1 rounded-full shadow-md`}>#{rank}</span>
          </div>
          <div className={`${isWinner ? '' : 'text-center'}`}>
            <h3 className={`${isWinner ? 'text-2xl' : 'text-xl'} font-bold text-slate-800`}>{candidate.employee.name}</h3>
            <p className="text-sm text-slate-500">{candidate.employee.employeeId}</p>
            <p className="text-sm text-slate-600 mt-1">Total Score: <span className={`font-bold ${isWinner ? 'text-amber-600 text-lg' : 'text-blue-700'}`}>{candidate.totalScore}</span></p>
          </div>
        </div>
        <blockquote className="text-sm text-slate-600 mb-5 flex-1 border-l-4 border-slate-200 pl-4 italic">
          {candidate.reason}
        </blockquote>
        
        {chartData.length > 0 && (
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="label" hide />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="count" barSize={20} radius={[0, 10, 10, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Employee of the Month</h1>
          <p className="text-slate-500 mt-2">Identify top performers based on task completion grades.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <button onClick={handleExport} className="p-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm" title="Export as CSV">
            <ArrowDownTrayIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {(isLoading || isFetching) ? (
        <div className="text-center py-16 text-slate-500">Loading candidates...</div>
      ) : (
        <>
          {candidates.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <CandidateCard key={candidates[0].employee._id} candidate={candidates[0]} rank={1} isWinner={true} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {candidates.slice(1, 3).map((candidate, index) => (
                  <CandidateCard key={candidate.employee._id} candidate={candidate} rank={index + 2} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 bg-white rounded-xl border border-dashed">
              <TrophyIcon className="h-16 w-16 mx-auto text-slate-400 mb-4" />
              <p className="font-semibold text-lg">No Employee of the Month candidates found for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}.</p>
              <p className="text-sm mt-2">Ensure tasks were completed and approved during this period.</p>
            </div>
          )}
          <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6 mt-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4">How Grades Are Calculated</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex gap-3"><strong className="font-semibold text-emerald-600 w-20">Completed:</strong><span>Task progress was 100% upon approval (+5 points).</span></li>
              <li className="flex gap-3"><strong className="font-semibold text-blue-600 w-20">Moderate:</strong><span>Task progress was 80% - 99% upon approval (+3 points).</span></li>
              <li className="flex gap-3"><strong className="font-semibold text-amber-600 w-20">Low:</strong><span>Task progress was 60% - 79% upon approval (+1 point).</span></li>
              <li className="flex gap-3"><strong className="font-semibold text-red-600 w-20">Pending:</strong><span>Task progress was below 60% upon approval (0 points).</span></li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default EmployeeOfTheMonth;