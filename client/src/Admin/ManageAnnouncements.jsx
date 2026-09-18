import React, { useState } from 'react';
import { useGetAllAnnouncementsQuery, useCreateAnnouncementMutation, useDeleteAnnouncementMutation } from '../services/EmployeApi';
import toast from 'react-hot-toast';
import { MegaphoneIcon, PlusIcon, TrashIcon, ArrowPathIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const ManageAnnouncements = () => {
  const { data: announcements = [], isLoading } = useGetAllAnnouncementsQuery();
  const [createAnnouncement, { isLoading: isCreating }] = useCreateAnnouncementMutation();
  const [deleteAnnouncement, { isLoading: isDeleting }] = useDeleteAnnouncementMutation();
  const [searchValue, setSearchValue] = useState('');
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });

  const totalAnnouncements = announcements.length;
  const publishedAnnouncements = announcements.filter((ann) => ann.isActive).length;
  const draftAnnouncements = announcements.filter((ann) => !ann.isActive).length;
  const filteredAnnouncements = announcements.filter((ann) =>
    ann.title.toLowerCase().includes(searchValue.toLowerCase()) ||
    ann.content.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) { toast.error('Title and content are required.'); return; }
    try {
      await createAnnouncement(newAnnouncement).unwrap();
      toast.success('New announcement is now active!');
      setNewAnnouncement({ title: '', content: '' });
    } catch { toast.error('Failed to create announcement.'); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAnnouncement(id).unwrap();
      toast.success('Announcement deleted.');
    } catch { toast.error('Failed to delete announcement.'); }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: '#DFCDFE' }}>
      <div className="mx-auto max-w-[1480px] space-y-8">

        {/* Header + stat cards */}
        <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
          <div className="mb-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Manage Announcements</h1>
            <div className="h-1 w-12 rounded-full mt-1 mb-3" style={{ background: 'linear-gradient(90deg,#48306A,#8E5FD0)' }} />
            <p className="text-sm text-slate-500">Create and manage company wide announcements. The latest one created will be active.</p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: MegaphoneIcon, label: 'Total Announcements', value: totalAnnouncements, color: 'bg-purple-100 text-purple-700', bar: 'bg-purple-500' },
              { icon: ArrowPathIcon, label: 'Published',           value: publishedAnnouncements, color: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500' },
              { icon: PlusIcon,      label: 'Drafts',              value: draftAnnouncements, color: 'bg-sky-100 text-sky-700', bar: 'bg-sky-500' },
              { icon: TrashIcon,     label: 'Scheduled',           value: 0, color: 'bg-orange-100 text-orange-700', bar: 'bg-orange-500' },
            ].map(({ icon: Icon, label, value, color, bar }) => (
              <div key={label} className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className={`rounded-2xl p-3 ${color}`}><Icon className="h-5 w-5" /></div>
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{label}</span>
                </div>
                <p className="mt-5 text-3xl font-bold text-slate-800">{value}</p>
                <div className={`mt-4 h-1 w-16 rounded-full ${bar}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          {/* Create form */}
          <section className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800">Create New Announcements</h2>
            <p className="mt-2 text-sm text-slate-500">Write important company updates, notices, & announcements for all employees.</p>
            <form onSubmit={handleCreate} className="mt-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Announcements Title*</label>
                <input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  placeholder="Enter announcement title"
                  className="w-full rounded-2xl border border-purple-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Announcement Content*</label>
                <div className="rounded-2xl border border-purple-200 bg-slate-50 p-3">
                  <textarea
                    rows="8"
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                    placeholder="Write your announcement here..."
                    className="w-full resize-none rounded-xl border border-transparent bg-white px-4 py-4 text-sm outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
                <p className="text-right text-xs text-slate-400">0/2000 Characters</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => setNewAnnouncement({ title: '', content: '' })}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 sm:w-auto">
                  Cancel
                </button>
                <button type="submit" disabled={isCreating}
                  className="inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-60 sm:w-auto"
                  style={{ background: 'linear-gradient(135deg,#48306A,#8E5FD0)' }}>
                  {isCreating ? <ArrowPathIcon className="mr-2 h-5 w-5 animate-spin" /> : <PlusIcon className="mr-2 h-5 w-5" />}
                  {isCreating ? 'Publishing...' : 'Publish Announcements'}
                </button>
              </div>
            </form>
          </section>

          {/* History */}
          <section className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Announcements History</h2>
                <p className="mt-2 text-sm text-slate-500">Recently published announcements.</p>
              </div>
              <div className="relative w-full sm:w-72">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input type="text" value={searchValue} onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search announcements..."
                  className="w-full rounded-xl border border-purple-200 bg-slate-50 py-3 pl-12 pr-4 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100" />
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {isLoading ? (
                <div className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500">Loading announcements...</div>
              ) : filteredAnnouncements.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500">No announcements found.</div>
              ) : (
                filteredAnnouncements.map((ann) => (
                  <div key={ann._id} className="flex items-center justify-between gap-4 rounded-2xl border border-purple-100 bg-slate-50 p-4 transition hover:border-purple-300 hover:bg-white">
                    <div className="flex items-center gap-4">
                      <div className="rounded-2xl bg-purple-600 p-3 text-white shadow-sm">
                        <MegaphoneIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">{ann.title}</h3>
                        <p className="mt-1 text-xs text-slate-500">{new Date(ann.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Published</span>
                      <button onClick={() => handleDelete(ann._id)} disabled={isDeleting}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-red-500 shadow-sm transition hover:bg-red-100 hover:text-red-700">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ManageAnnouncements;
