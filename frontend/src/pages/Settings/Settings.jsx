import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

// ─────────────── SETTINGS SECTION WRAPPER ──────────────────────────────────

const Section = ({ title, icon, children }) => (
  <div className="glass-panel rounded-xl border border-outline-variant/50 overflow-hidden">
    <div className="flex items-center gap-3 px-6 py-4 border-b border-outline-variant/40 bg-surface-container/40">
      <span className="material-symbols-outlined text-[20px] text-primary">{icon}</span>
      <h2 className="font-semibold text-on-surface text-sm">{title}</h2>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

// ─────────────── FORM ROW ───────────────────────────────────────────────────

const FormRow = ({ label, hint, children }) => (
  <div className="flex flex-col md:flex-row md:items-start gap-3 py-5 border-b border-outline-variant/30 last:border-b-0">
    <div className="md:w-56 shrink-0">
      <p className="font-medium text-on-surface text-sm">{label}</p>
      {hint && <p className="text-xs text-on-surface-variant/70 mt-0.5 leading-relaxed">{hint}</p>}
    </div>
    <div className="flex-1">{children}</div>
  </div>
);

// ─────────────── SETTINGS PAGE ──────────────────────────────────────────────

const Settings = () => {
  const { toggleMobileSidebar } = useOutletContext();
  const { user, logout, checkAuth } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');

  // Profile form
  const [name, setName] = useState(user?.name || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Notifications (local-only preference)
  const [notifEmailTask, setNotifEmailTask] = useState(true);
  const [notifEmailProject, setNotifEmailProject] = useState(false);
  const [notifBrowser, setNotifBrowser] = useState(true);

  // ── Profile update ──
  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setProfileError('Name cannot be empty.');
      return;
    }
    try {
      setProfileLoading(true);
      setProfileError('');
      setProfileSuccess('');
      const res = await api.put('/auth/update-profile', { name });
      if (res.data?.success) {
        setProfileSuccess('Profile updated successfully!');
        await checkAuth();
      } else {
        setProfileError(res.data?.message || 'Failed to update profile.');
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Error updating profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  // ── Password update ──
  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    try {
      setPasswordLoading(true);
      setPasswordError('');
      setPasswordSuccess('');
      const res = await api.put('/auth/change-password', { currentPassword, newPassword });
      if (res.data?.success) {
        setPasswordSuccess('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(res.data?.message || 'Failed to change password.');
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Error changing password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // ── Logout ──
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const TABS = [
    { id: 'profile', label: 'Profile', icon: '' },
    { id: 'security', label: 'Security', icon: '' },
    { id: 'notifications', label: 'Notifications', icon: '' },
    { id: 'appearance', label: 'Appearance', icon: '' },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Top Bar ── */}
      <header className="flex items-center gap-4 px-6 py-4 border-b border-outline-variant/50 bg-surface-container/30 flex-shrink-0">
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-variant transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>
        <div>
          <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-0.5">
            <span className="material-symbols-outlined text-[14px]">settings</span>
            <span>Settings</span>
          </div>
          <h1 className="font-bold text-on-surface text-lg">Account Settings</h1>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-8">

          {/* User profile hero card */}
          <div className="glass-panel rounded-xl p-6 border border-outline-variant/50 flex items-center gap-5 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="w-16 h-16 rounded-xl bg-primary-container border-2 border-primary/40 flex items-center justify-center text-xl font-bold text-primary shadow-lg shrink-0">
              {initials}
            </div>
            <div>
              <h2 className="font-bold text-on-surface text-lg">{user?.name || 'User'}</h2>
              <p className="text-on-surface-variant text-sm">{user?.email || ''}</p>
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Active member
              </span>
            </div>
            <div className="ml-auto hidden sm:block">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-error border border-error/30 hover:bg-error/10 transition-colors text-sm font-medium"
              >
                <span className="material-symbols-outlined text-[17px]"></span>
                Sign Out
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-surface-container rounded-lg p-1 border border-outline-variant/40">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-black shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ── Profile Tab ── */}
          {activeTab === 'profile' && (
            <Section title="Profile Information" icon="manage_accounts">
              <form onSubmit={handleProfileSave}>
                {profileSuccess && (
                  <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    {profileSuccess}
                  </div>
                )}
                {profileError && (
                  <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    {profileError}
                  </div>
                )}

                <FormRow label="Display Name" hint="This is how your name appears across the app.">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full max-w-sm px-4 py-2.5 rounded-lg bg-surface-container border border-outline-variant text-on-surface text-sm focus:border-primary focus:outline-none transition-colors"
                    placeholder="Your full name"
                  />
                </FormRow>

                <FormRow label="Email Address" hint="Contact your administrator to change your email.">
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full max-w-sm px-4 py-2.5 rounded-lg bg-surface-variant/30 border border-outline-variant text-on-surface-variant text-sm cursor-not-allowed opacity-60"
                  />
                </FormRow>

                <FormRow label="Member Since" hint="Your account creation date.">
                  <p className="text-on-surface text-sm py-2.5">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                  </p>
                </FormRow>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-1.5"
                  >
                    {profileLoading ? 'Saving...' : 'Save Changes'}
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </button>
                </div>
              </form>
            </Section>
          )}

          {/* ── Security Tab ── */}
          {activeTab === 'security' && (
            <Section title="Change Password" icon="lock">
              <form onSubmit={handlePasswordSave}>
                {passwordSuccess && (
                  <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    {passwordSuccess}
                  </div>
                )}
                {passwordError && (
                  <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    {passwordError}
                  </div>
                )}

                <FormRow label="Current Password" hint="Enter your existing password to confirm.">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full max-w-sm px-4 py-2.5 rounded-lg bg-surface-container border border-outline-variant text-on-surface text-sm focus:border-primary focus:outline-none transition-colors"
                    placeholder="••••••••"
                    required
                  />
                </FormRow>

                <FormRow label="New Password" hint="Must be at least 6 characters long.">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full max-w-sm px-4 py-2.5 rounded-lg bg-surface-container border border-outline-variant text-on-surface text-sm focus:border-primary focus:outline-none transition-colors"
                    placeholder="••••••••"
                    required
                  />
                </FormRow>

                <FormRow label="Confirm Password" hint="Re-enter your new password.">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full max-w-sm px-4 py-2.5 rounded-lg bg-surface-container border border-outline-variant text-on-surface text-sm focus:border-primary focus:outline-none transition-colors"
                    placeholder="••••••••"
                    required
                  />
                </FormRow>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-1.5"
                  >
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                    <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                  </button>
                </div>
              </form>
            </Section>
          )}

          {/* ── Notifications Tab ── */}
          {activeTab === 'notifications' && (
            <Section title="Notification Preferences" icon="notifications">
              <FormRow label="Task Assignments" hint="Get notified when a task is assigned to you.">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={notifEmailTask} onChange={(e) => setNotifEmailTask(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-surface-variant rounded-full peer peer-checked:bg-primary transition-colors duration-200" />
                  <div className="absolute w-4 h-4 bg-white rounded-full left-1 top-1 peer-checked:translate-x-5 transition-transform duration-200 shadow" />
                </label>
              </FormRow>

              <FormRow label="Project Updates" hint="Receive email digests on project activity.">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={notifEmailProject} onChange={(e) => setNotifEmailProject(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-surface-variant rounded-full peer peer-checked:bg-primary transition-colors duration-200" />
                  <div className="absolute w-4 h-4 bg-white rounded-full left-1 top-1 peer-checked:translate-x-5 transition-transform duration-200 shadow" />
                </label>
              </FormRow>

              <FormRow label="Browser Notifications" hint="Show desktop alerts for important events.">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={notifBrowser} onChange={(e) => setNotifBrowser(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-surface-variant rounded-full peer peer-checked:bg-primary transition-colors duration-200" />
                  <div className="absolute w-4 h-4 bg-white rounded-full left-1 top-1 peer-checked:translate-x-5 transition-transform duration-200 shadow" />
                </label>
              </FormRow>

              <div className="flex justify-end pt-4">
                <button className="btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-1.5">
                  Save Preferences
                  <span className="material-symbols-outlined text-[16px]">check</span>
                </button>
              </div>
            </Section>
          )}

          {/* ── Appearance Tab ── */}
          {activeTab === 'appearance' && (
            <Section title="Appearance" icon="palette">
              <FormRow label="Color Theme" hint="The app uses an emerald dark theme by default.">
                <div className="flex gap-3 flex-wrap">
                  {[
                    { name: 'Emerald Dark', color: '#00c27b', active: true },
                    { name: 'Sapphire', color: '#4a90e2', active: false },
                    { name: 'Crimson', color: '#e24a4a', active: false },
                  ].map((t) => (
                    <button
                      key={t.name}
                      title={t.name}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                        t.active
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-outline-variant text-on-surface-variant hover:border-outline opacity-60 cursor-not-allowed'
                      }`}
                      disabled={!t.active}
                    >
                      <span className="w-4 h-4 rounded-full" style={{ backgroundColor: t.color }} />
                      {t.name}
                      {t.active && <span className="material-symbols-outlined text-[14px]">check</span>}
                    </button>
                  ))}
                </div>
              </FormRow>

              <FormRow label="Sidebar" hint="Choose your preferred sidebar display mode.">
                <div className="flex gap-2">
                  {['Expanded', 'Compact'].map((mode) => (
                    <button
                      key={mode}
                      className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                        mode === 'Expanded'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-outline-variant text-on-surface-variant opacity-60 cursor-not-allowed'
                      }`}
                      disabled={mode !== 'Expanded'}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </FormRow>
            </Section>
          )}

          {/* Danger Zone */}
          <div className="rounded-xl border border-error/30 bg-error/5 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-error/20">
              <span className="material-symbols-outlined text-[20px] text-error">warning</span>
              <h2 className="font-semibold text-error text-sm">Danger Zone</h2>
            </div>
            <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-medium text-on-surface text-sm">Sign out from all sessions</p>
                <p className="text-xs text-on-surface-variant mt-0.5">This will log you out of all active browser sessions.</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg text-error border border-error/40 hover:bg-error hover:text-white transition-all text-sm font-medium shrink-0 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]"></span>
                Sign Out
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
