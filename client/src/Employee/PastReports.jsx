import React from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

const PastReportsList = ({ reports, onSelectReport, activeReportId }) => {
  const renderContent = () => {
    if (!reports) {
      return (
        <div className="p-4 text-sm text-red-500 flex items-center gap-2">
          <ExclamationCircleIcon className="h-5 w-5" /> Could not load reports.
        </div>
      );
    }

    return (
      <>
        {reports.map(report => (
          <button
            key={report._id}
            onClick={() => onSelectReport(report)}
            className={`w-full text-left px-4 py-3 rounded-xl transition-colors duration-200 ${
              activeReportId === report._id
                ? 'bg-purple-50 border border-purple-300'
                : 'text-slate-600 hover:bg-purple-50/60'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col flex-1 min-w-0">
                <p className={`font-semibold truncate ${activeReportId === report._id ? 'text-purple-700' : 'text-slate-700'}`}>
                  {new Date(report.reportDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {typeof report.summary === 'string' ? report.summary : ''}
                </p>
              </div>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0 ${
                report.status === 'Submitted' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {report.status}
              </span>
            </div>
          </button>
        ))}
      </>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-purple-100">
      <div className="p-4 border-b border-purple-100 flex-shrink-0">
        <h3 className="font-bold text-lg text-slate-800">Report History</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {renderContent()}
      </div>
    </div>
  );
};

export default PastReportsList;
