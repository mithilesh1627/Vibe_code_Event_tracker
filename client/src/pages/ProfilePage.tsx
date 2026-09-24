import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Bell,
  Calendar,
  Share2,
  BookmarkCheck,
  Sliders,
  Save,
} from 'lucide-react';
import { useUserProfile, useUpdateProfile, useUpdateReminders } from '../hooks/useProfile.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { Button } from '../components/common/Button.js';
import { Input } from '../components/common/Input.js';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
];

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { data, isLoading } = useUserProfile();
  const updateProfileMutation = useUpdateProfile();
  const updateRemindersMutation = useUpdateReminders();
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [reminderHours, setReminderHours] = useState(24);

  useEffect(() => {
    if (data?.user) {
      setName(data.user.name);
      setAvatar(data.user.avatar || '');
      if (data.user.reminderSettings) {
        setEmailEnabled(data.user.reminderSettings.emailEnabled);
        setPushEnabled(data.user.reminderSettings.pushEnabled);
        setReminderHours(data.user.reminderSettings.reminderHoursBefore || 24);
      }
    }
  }, [data]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfileMutation.mutateAsync({ name, avatar });
      success('Profile updated', 'Your profile details have been saved.');
    } catch (err: any) {
      error(err.message || 'Failed to update profile.');
    }
  };

  const handleSaveReminders = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateRemindersMutation.mutateAsync({
        emailEnabled,
        pushEnabled,
        reminderHoursBefore: reminderHours,
      });
      success('Preferences saved', 'Your event reminder settings have been updated.');
    } catch (err: any) {
      error(err.message || 'Failed to update reminder settings.');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 animate-pulse space-y-6">
        <div className="h-8 w-40 bg-slate-200 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-28 bg-slate-200 rounded-2xl" />
          <div className="h-28 bg-slate-200 rounded-2xl" />
          <div className="h-28 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  const stats = data?.stats || {
    upcomingEvents: 0,
    pastEvents: 0,
    totalEvents: 0,
    invitesCreated: 0,
    friendsReferredClicks: 0,
  };

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <User className="w-8 h-8 text-indigo-600" />
          Account Profile & Preferences
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal identity, activity analytics, and event notifications.
        </p>
      </div>

      {/* Activity Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Upcoming</span>
            <Calendar className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats.upcomingEvents}</p>
          <p className="text-xs text-slate-500 mt-0.5">Events registered</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total RSVPs</span>
            <BookmarkCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats.totalEvents}</p>
          <p className="text-xs text-slate-500 mt-0.5">Lifetime activity</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Invites Made</span>
            <Share2 className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats.invitesCreated}</p>
          <p className="text-xs text-slate-500 mt-0.5">Referral links</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Friend Views</span>
            <Sliders className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats.friendsReferredClicks}</p>
          <p className="text-xs text-slate-500 mt-0.5">Referred clicks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Details Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            Personal Details
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Current Avatar & Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Profile Avatar
              </label>
              <div className="flex items-center gap-4 mb-3">
                <img
                  src={
                    avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'User')}`
                  }
                  alt="Profile"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-100 shadow-sm"
                />
                <div className="flex-1 text-xs text-slate-500">
                  Select a preset below or enter a custom image URL.
                </div>
              </div>

              {/* Preset Avatar Selection */}
              <div className="flex items-center gap-2">
                {PRESET_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatar(url)}
                    className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all ${
                      avatar === url
                        ? 'border-indigo-600 scale-105 shadow-sm'
                        : 'border-transparent hover:border-slate-300'
                    }`}
                  >
                    <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={data?.user?.email || user?.email || ''}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm px-3.5 py-2.5 cursor-not-allowed"
              />
              <p className="text-[11px] text-slate-400 mt-1">Email cannot be changed.</p>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={updateProfileMutation.isPending}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Profile
              </Button>
            </div>
          </form>
        </div>

        {/* Reminder Settings Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" />
              Event Reminder Settings
            </h2>

            <form id="reminders-form" onSubmit={handleSaveReminders} className="space-y-6">
              {/* Email Notifications Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white text-indigo-600 border border-slate-100">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Email Reminders</h4>
                    <p className="text-xs text-slate-500">Receive schedule alerts directly in your inbox</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailEnabled}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmailEnabled(e.target.checked)}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              {/* Push Notifications Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white text-indigo-600 border border-slate-100">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Push Notifications</h4>
                    <p className="text-xs text-slate-500">Real-time alerts on your device for upcoming shows</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={pushEnabled}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPushEnabled(e.target.checked)}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              {/* Reminder Timing Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  When should we remind you?
                </label>
                <select
                  value={reminderHours}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setReminderHours(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value={2}>2 hours before the event</option>
                  <option value={12}>12 hours before the event</option>
                  <option value={24}>24 hours (1 day) before the event</option>
                  <option value={48}>48 hours (2 days) before the event</option>
                  <option value={72}>72 hours (3 days) before the event</option>
                </select>
              </div>
            </form>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <Button
              type="submit"
              form="reminders-form"
              variant="secondary"
              size="md"
              isLoading={updateRemindersMutation.isPending}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Update Notification Preferences
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
