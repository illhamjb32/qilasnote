'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { deleteAllMilkRecords, getUserSettings, updateUserSettings } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default function Settings() {
  const [dailyTarget, setDailyTarget] = useState(1000);
  const [showToast, setShowToast] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [reminderInterval, setReminderInterval] = useState('4');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getUserSettings();
      if (settings) {
        setDailyTarget(settings.daily_target);
        setNotificationEnabled(settings.notifications_enabled);
        setReminderInterval(settings.reminder_interval.toString());
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    try {
      await updateUserSettings({
        daily_target: dailyTarget,
        notifications_enabled: notificationEnabled,
        reminder_interval: parseInt(reminderInterval)
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Gagal menyimpan pengaturan.');
    }
  };

  const handleNotificationToggle = () => {
    setNotificationEnabled(!notificationEnabled);
  };

  const handleIntervalChange = (value: string) => {
    setReminderInterval(value);
  };

  const handleDeleteAllData = async () => {
    if (confirm('Yakin ingin menghapus semua data? Tindakan ini tidak dapat dibatalkan.')) {
      try {
        await deleteAllMilkRecords();
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      } catch (error) {
        console.error('Error deleting all data:', error);
        alert('Gagal menghapus data. Silakan coba lagi.');
      }
    }
  };

  const presetTargets = [500, 600, 800, 1000, 1200, 1500];

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <Link href="/">
          <button className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
          </button>
        </Link>
        <h1 className="text-headline-sm text-primary font-quicksand">Pengaturan</h1>
        <div className="w-10" />
      </header>

      {/* Main Content */}
      <main className="app-content">
        {/* Target Section */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">track_changes</span>
            </div>
            <div>
              <h2 className="text-headline-sm text-on-surface">Target Harian</h2>
              <p className="text-label text-on-surface-variant">Atur batas pencapaian minum susu</p>
            </div>
          </div>

          {/* Current Target Display */}
          <div className="bg-primary-container/30 rounded-xl p-6 mb-6 text-center">
            <p className="text-label text-on-surface-variant mb-1">Target Saat Ini</p>
            <p className="text-display text-primary">{dailyTarget} <span className="text-headline text-on-surface-variant">ml</span></p>
          </div>

          {/* Preset Buttons */}
          <div className="mb-6">
            <p className="text-label text-on-surface-variant mb-3">Pilih Target Cepat</p>
            <div className="grid grid-cols-3 gap-2">
              {presetTargets.map((target) => (
                <button
                  key={target}
                  onClick={() => setDailyTarget(target)}
                  className={`py-3 rounded-xl text-label transition-all ${
                    dailyTarget === target
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {target}
                </button>
              ))}
            </div>
          </div>

          {/* Range Slider */}
          <div className="mb-6">
            <label className="text-label text-on-surface-variant mb-2 block">Atur dengan Slider</label>
            <input
              type="range"
              value={dailyTarget}
              onChange={(e) => setDailyTarget(parseInt(e.target.value))}
              min="100"
              max="3000"
              step="50"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-outline mt-1">
              <span>100 ml</span>
              <span className="text-primary font-semibold">{dailyTarget} ml</span>
              <span>3000 ml</span>
            </div>
          </div>

          {/* Custom Input */}
          <div>
            <label className="text-label text-on-surface-variant mb-2 block">Atur Manual</label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="number"
                  value={dailyTarget}
                  onChange={(e) => setDailyTarget(Math.max(100, Math.min(5000, parseInt(e.target.value) || 100)))}
                  className="input pr-12"
                  min="100"
                  max="5000"
                  step="50"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-label">ml</span>
              </div>
              <button
                onClick={handleSave}
                className="btn btn-primary px-6"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary">notifications</span>
            </div>
            <div>
              <h2 className="text-headline-sm text-on-surface">Notifikasi</h2>
              <p className="text-label text-on-surface-variant">Pengaturan pengingat minum</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Toggle */}
            <div className="flex items-center justify-between p-4 bg-surface-container rounded-xl">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-on-surface-variant">notifications_active</span>
                <div>
                  <p className="text-body text-on-surface">Pengingat Otomatis</p>
                  <p className="text-label text-outline">Aktifkan notifikasi pengingat</p>
                </div>
              </div>
              <button
                onClick={handleNotificationToggle}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  notificationEnabled ? 'bg-primary' : 'bg-surface-container-high'
                }`}
              >
                <span
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                    notificationEnabled ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Interval */}
            <div className={`p-4 bg-surface-container rounded-xl ${!notificationEnabled ? 'opacity-50' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant">schedule</span>
                  <div>
                    <p className="text-body text-on-surface">Interval Pengingat</p>
                    <p className="text-label text-outline">Setiap berapa jam</p>
                  </div>
                </div>
              </div>
              <select
                value={reminderInterval}
                onChange={(e) => handleIntervalChange(e.target.value)}
                disabled={!notificationEnabled}
                className="input w-full"
              >
                <option value="2">Setiap 2 jam</option>
                <option value="3">Setiap 3 jam</option>
                <option value="4">Setiap 4 jam</option>
                <option value="6">Setiap 6 jam</option>
                <option value="8">Setiap 8 jam</option>
              </select>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-tertiary">info</span>
            </div>
            <div>
              <h2 className="text-headline-sm text-on-surface">Tentang Aplikasi</h2>
              <p className="text-label text-on-surface-variant">Info aplikasi ini</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between p-3 bg-surface-container rounded-xl">
              <span className="text-on-surface-variant">Versi</span>
              <span className="text-on-surface font-semibold">1.0.0</span>
            </div>
            <div className="flex justify-between p-3 bg-surface-container rounded-xl">
              <span className="text-on-surface-variant">Nama</span>
              <span className="text-on-surface font-semibold">Qila&apos;s Note</span>
            </div>
            <div className="flex justify-between p-3 bg-surface-container rounded-xl">
              <span className="text-on-surface-variant">Tipe</span>
              <span className="text-on-surface font-semibold text-right">Pencatat Minum Susu Bayi</span>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center">
              <span className="material-symbols-outlined text-error">storage</span>
            </div>
            <div>
              <h2 className="text-headline-sm text-on-surface">Kelola Data</h2>
              <p className="text-label text-on-surface-variant">Hapus semua data jika diperlukan</p>
            </div>
          </div>

          <button
            onClick={handleDeleteAllData}
            className="btn w-full py-4 bg-error-container text-error hover:bg-error hover:text-on-error"
          >
            <span className="material-symbols-outlined mr-2">delete_forever</span>
            Hapus Semua Data
          </button>
        </div>
      </main>

      {/* Toast */}
      {showToast && (
        <div className="toast">
          <span className="material-symbols-outlined text-on-tertiary-container">check_circle</span>
          <span className="text-body">Berhasil disimpan!</span>
        </div>
      )}
    </div>
  );
}
