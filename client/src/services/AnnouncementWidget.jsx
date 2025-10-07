import React from 'react';
import { useGetActiveAnnouncementQuery } from '../services/EmployeApi';
import { MegaphoneIcon } from '@heroicons/react/24/solid';

const AnnouncementWidget = () => {
  const { data: announcement, isLoading } = useGetActiveAnnouncementQuery();

  if (isLoading || !announcement) {
    return null; // Don't render anything if there's no announcement or it's loading
  }

  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg p-6 overflow-hidden mb-8">
      <div className="absolute -right-8 -top-8 w-32 h-32 text-white/10">
        <MegaphoneIcon />
      </div>
      <div className="relative flex items-center gap-4">
        <div className="flex-shrink-0 bg-white/20 p-3 rounded-full">
          <MegaphoneIcon className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg">{announcement.title}</h3>
          <p className="text-sm text-indigo-100">{announcement.content}</p>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementWidget;