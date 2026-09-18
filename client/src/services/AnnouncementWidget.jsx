import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { MegaphoneIcon } from '@heroicons/react/24/solid';
import { useGetActiveAnnouncementQuery, useDismissAnnouncementMutation } from './EmployeApi';
import toast from 'react-hot-toast';
import EOMCelebration from './EOMCelebration';

// ── Main ──────────────────────────────────────────────────────────────────
const AnnouncementWidget = () => {
  const { data: announcement, isLoading, isError } = useGetActiveAnnouncementQuery();
  const id = announcement?._id;
  const isEOM = !!announcement?.relatedEmployee;

  const [dismissAnnouncement] = useDismissAnnouncementMutation();

  const handleDismiss = () => {
    if (!id) return;
    dismissAnnouncement(id).unwrap()
      .then(() => toast.success('Announcement dismissed.'))
      .catch(() => toast.error('Failed to dismiss announcement.'));
  };

  const handleEOMDismiss = () => {
    if (!id) return;
    dismissAnnouncement(id);
  };



  if (isLoading) {
    return (
      <div className="rounded-2xl mb-6 p-4 flex items-center gap-3 animate-pulse"
        style={{ background: 'rgba(142,95,208,0.08)', border: '1px solid rgba(142,95,208,0.15)' }}>
        <div className="h-6 w-6 rounded-full bg-purple-200"/>
        <div className="h-4 rounded bg-purple-100 w-3/4"/>
      </div>
    );
  }

  if (isError || !announcement) return null;

  if (isEOM) {
    return <EOMCelebration announcement={announcement} onDismiss={handleEOMDismiss} />;
  }

  // ── Regular announcement banner ───────────────────────────────────
  return (
    <div style={{ marginBottom: '28px', animation: 'annIn 0.4s ease-out' }}>
      <style>{`
        @keyframes annIn { from{opacity:0;transform:translateY(-10px);} to{opacity:1;transform:translateY(0);} }
        @keyframes annPulse { 0%,100%{transform:rotate(-8deg) scale(1);} 50%{transform:rotate(8deg) scale(1.18);} }
        @keyframes annShimmer { 0%,100%{opacity:0;} 50%{opacity:1;} }
      `}</style>
      <div style={{
        borderRadius: '16px', overflow: 'hidden',
        background: 'linear-gradient(135deg,#48306A 0%,#6b3fa0 50%,#8E5FD0 100%)',
        boxShadow: '0 4px 24px rgba(72,48,106,0.35)',
        border: '1px solid rgba(142,95,208,0.4)',
        position: 'relative',
      }}>
        {/* Shimmer line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)',
          animation: 'annShimmer 2.5s ease-in-out infinite',
        }}/>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 18px' }}>
          {/* Icon */}
          <div style={{
            flexShrink: 0, width: '42px', height: '42px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <MegaphoneIcon style={{ width: '22px', height: '22px', color: '#fff', animation: 'annPulse 2s ease-in-out infinite' }}/>
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', margin: '0 0 3px' }}>
              Announcement
            </p>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#fff', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {announcement.title}
            </h3>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: 0, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {announcement.content}
            </p>
          </div>

          {/* Related employee avatar */}
          {announcement.relatedEmployee && (
            <img
              src={announcement.relatedEmployee.profilePicture || `https://ui-avatars.com/api/?name=${announcement.relatedEmployee.name}&background=8E5FD0&color=fff`}
              alt={announcement.relatedEmployee.name}
              style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)', flexShrink: 0 }}
            />
          )}

          {/* Dismiss */}
          <button onClick={handleDismiss} style={{
            flexShrink: 0, width: '30px', height: '30px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }} aria-label="Dismiss">
            <XMarkIcon style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.8)' }}/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementWidget;
