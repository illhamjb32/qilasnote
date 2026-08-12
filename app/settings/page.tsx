'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getUserSettings, updateUserSettings } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default function Settings() {
  const [dailyTarget, setDailyTarget] = useState(1000);
  const [dailyTargetMpasi, setDailyTargetMpasi] = useState(500);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Berhasil disimpan!');
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [reminderInterval, setReminderInterval] = useState('4');

  useEffect(() => {
    loadSettings();
    
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const reminderEnabled = localStorage.getItem('reminderEnabled') === 'true';
      const savedInterval = localStorage.getItem('reminderInterval');
      
      if (reminderEnabled && savedInterval && Notification.permission === 'granted') {
        scheduleReminders(parseInt(savedInterval));
      }
    }
  }, []);

  useEffect(() => {
    if (notificationEnabled && typeof window !== 'undefined' && 'Notification' in window) {
      clearReminders();
      scheduleReminders(parseInt(reminderInterval));
    }
  }, [reminderInterval, notificationEnabled]);

  const loadSettings = async () => {
    try {
      const settings = await getUserSettings();
      if (settings) {
        setDailyTarget(settings.daily_target);
        setDailyTargetMpasi(settings.daily_target_mpasi || 500);
        localStorage.setItem('dailyTarget', settings.daily_target.toString());
        localStorage.setItem('dailyTargetMpasi', (settings.daily_target_mpasi || 500).toString());
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
        daily_target_mpasi: dailyTargetMpasi,
        notifications_enabled: notificationEnabled,
        reminder_interval: parseInt(reminderInterval)
      });
      localStorage.setItem('dailyTarget', dailyTarget.toString());
      localStorage.setItem('dailyTargetMpasi', dailyTargetMpasi.toString());
      setToastMessage('Berhasil disimpan!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Gagal menyimpan pengaturan.');
    }
  };

  const handleNotificationToggle = async () => {
    if (!notificationEnabled) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotificationEnabled(true);
          scheduleReminders(parseInt(reminderInterval));
          setToastMessage('Pengingat diaktifkan!');
          setShowToast(true);
          setTimeout(() => setShowToast(false), 2000);
        } else {
          alert('Izin notifikasi ditolak. Silakan aktifkan di pengaturan browser.');
        }
      } else {
        alert('Browser tidak mendukung notifikasi.');
      }
    } else {
      setNotificationEnabled(false);
      clearReminders();
      setToastMessage('Pengingat dinonaktifkan');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  const scheduleReminders = (intervalHours: number) => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      localStorage.setItem('reminderEnabled', 'true');
      localStorage.setItem('reminderInterval', intervalHours.toString());
      localStorage.setItem('lastReminderCheck', Date.now().toString());
      
      const checkReminder = () => {
        const lastCheck = parseInt(localStorage.getItem('lastReminderCheck') || '0');
        const intervalMs = intervalHours * 60 * 60 * 1000;
        const now = Date.now();
        
        if (now - lastCheck >= intervalMs) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Qila\'s Note - Pengingat Makan', {
              body: `Waktunya memberi makan bayi! Sudah ${intervalHours} jam sejak pengingat terakhir.`,
              icon: '/icon-192x192.png',
              badge: '/icon-192x192.png',
              tag: 'feeding-reminder',
              requireInteraction: false
            });
          }
          localStorage.setItem('lastReminderCheck', now.toString());
        }
      };
      
      checkReminder();
      
      const reminderId = setInterval(checkReminder, 60000);
      
      if (typeof window !== 'undefined' && (window as any).currentReminderId) {
        clearInterval((window as any).currentReminderId);
      }
      (window as any).currentReminderId = reminderId;
    }
  };

  const clearReminders = () => {
    if (typeof window !== 'undefined') {
      if ((window as any).currentReminderId) {
        clearInterval((window as any).currentReminderId);
        (window as any).currentReminderId = null;
      }
      localStorage.removeItem('reminderEnabled');
      localStorage.removeItem('reminderInterval');
      localStorage.removeItem('lastReminderCheck');
    }
  };

  const handleIntervalChange = (value: string) => {
    setReminderInterval(value);
  };

  const handleClearCache = async () => {
    if (confirm('Yakin ingin menghapus cache browser? Data yang tersimpan di browser akan dihapus.')) {
      try {
        localStorage.clear();
        sessionStorage.clear();

        // Clear any IndexedDB databases
        if ('indexedDB' in window) {
          const databases = await indexedDB.databases();
          for (const db of databases) {
            if (db.name) {
              indexedDB.deleteDatabase(db.name);
            }
          }
        }

        setToastMessage('Cache berhasil dihapus!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      } catch (error) {
        console.error('Error clearing cache:', error);
        alert('Gagal menghapus cache. Silakan coba lagi.');
      }
    }
  };

  const presetTargetsSusu = [500, 600, 800, 1000, 1200, 1500];
  const presetTargetsMpasi = [200, 300, 400, 500, 600, 800];

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <Link href="/" className="no-underline">
          <button className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
          </button>
        </Link>
        <h1 className="text-headline-sm text-primary font-quicksand">Pengaturan</h1>
        <div className="w-10" />
      </header>

      {/* Main Content */}
      <main className="app-content">
        {/* Target Susu Section */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">local_drink</span>
            </div>
            <div>
              <h2 className="text-headline-sm text-on-surface">Target Susu Harian</h2>
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
              {presetTargetsSusu.map((target) => (
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

        {/* Target MPASI Section */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary">restaurant</span>
            </div>
            <div>
              <h2 className="text-headline-sm text-on-surface">Target MPASI Harian</h2>
              <p className="text-label text-on-surface-variant">Atur batas pencapaian makan MPASI</p>
            </div>
          </div>

          {/* Current Target Display */}
          <div className="bg-secondary-container/30 rounded-xl p-6 mb-6 text-center">
            <p className="text-label text-on-surface-variant mb-1">Target Saat Ini</p>
            <p className="text-display text-secondary">{dailyTargetMpasi} <span className="text-headline text-on-surface-variant">ml/gr</span></p>
          </div>

          {/* Preset Buttons */}
          <div className="mb-6">
            <p className="text-label text-on-surface-variant mb-3">Pilih Target Cepat</p>
            <div className="grid grid-cols-3 gap-2">
              {presetTargetsMpasi.map((target) => (
                <button
                  key={target}
                  onClick={() => setDailyTargetMpasi(target)}
                  className={`py-3 rounded-xl text-label transition-all ${
                    dailyTargetMpasi === target
                      ? 'bg-secondary text-on-secondary'
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
              value={dailyTargetMpasi}
              onChange={(e) => setDailyTargetMpasi(parseInt(e.target.value))}
              min="50"
              max="1000"
              step="10"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-outline mt-1">
              <span>50</span>
              <span className="text-secondary font-semibold">{dailyTargetMpasi} ml/gr</span>
              <span>1000</span>
            </div>
          </div>

          {/* Custom Input */}
          <div>
            <label className="text-label text-on-surface-variant mb-2 block">Atur Manual</label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="number"
                  value={dailyTargetMpasi}
                  onChange={(e) => setDailyTargetMpasi(Math.max(50, Math.min(2000, parseInt(e.target.value) || 50)))}
                  className="input pr-16"
                  min="50"
                  max="2000"
                  step="10"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-label">ml/gr</span>
              </div>
              <button
                onClick={handleSave}
                className="btn btn-secondary px-6"
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
              <span className="text-on-surface font-semibold text-right">Pencatat Susu & MPASI Bayi</span>
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
              <p className="text-label text-on-surface-variant">Hapus cache browser untuk membersihkan data sementara</p>
            </div>
          </div>

          <button
            onClick={handleClearCache}
            className="btn w-full py-4 bg-error-container text-error hover:bg-error hover:text-on-error"
          >
            <span className="material-symbols-outlined mr-2">cleaning_services</span>
            Hapus Cache Browser
          </button>
        </div>
      </main>

      {/* Toast */}
      {showToast && (
        <div className="toast">
          <span className="material-symbols-outlined text-on-tertiary-container">check_circle</span>
          <span className="text-body">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
