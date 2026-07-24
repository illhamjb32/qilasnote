'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MilkRecord } from '@/lib/types';
import { getMilkRecordsByDate, addMilkRecord } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default function Home() {
  const [totalToday, setTotalToday] = useState(0);
  const [amount, setAmount] = useState('');
  const [time, setTime] = useState('');
  const [historyToday, setHistoryToday] = useState<MilkRecord[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [dailyTarget, setDailyTarget] = useState(1000);
  const [loading, setLoading] = useState(false);

  const percentage = Math.min((totalToday / dailyTarget) * 100, 100);
  const circumference = 2 * Math.PI * 88;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    const savedTarget = localStorage.getItem('dailyTarget');
    if (savedTarget) {
      setDailyTarget(parseInt(savedTarget));
    }
    const now = new Date();
    setTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    loadData();
  }, []);

  const getTodayString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const loadData = async () => {
    try {
      const today = getTodayString();
      const data = await getMilkRecordsByDate(today);
      const total = data.reduce((sum, item) => sum + item.amount, 0);
      setTotalToday(total);
      setHistoryToday(data.slice(0, 5));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const now = new Date();
      const newRecord = {
        amount: parseInt(amount),
        time,
        date: getTodayString(),
        timestamp: now.toISOString()
      };
      await addMilkRecord(newRecord);
      setAmount('');
      setTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
      await loadData();
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Gagal menyimpan data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const quickInput = (value: number) => setAmount(value.toString());

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-xl">account_circle</span>
          </div>
          <h1 className="text-headline-sm text-primary font-quicksand">Qila&apos;s Note</h1>
        </div>
        <Link href="/settings">
          <button className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">settings</span>
          </button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="app-content">
        {/* Progress Card */}
        <div className="card p-8 relative overflow-hidden mb-6">
          <div className="absolute top-0 right-0 p-4">
            <span className="material-symbols-outlined text-primary-container opacity-30 text-6xl">water_drop</span>
          </div>

          <div className="relative w-48 h-48 mx-auto flex items-center justify-center mb-6">
            <svg className="w-full h-full">
              <circle cx="96" cy="96" r="88" fill="transparent" stroke="rgba(165, 216, 255, 0.2)" strokeWidth="12" />
              <circle
                className="progress-ring"
                cx="96" cy="96" r="88" fill="transparent"
                stroke="var(--primary)" strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-label text-on-surface-variant">Total Hari Ini</span>
              <span className="text-display text-primary">{totalToday}</span>
              <span className="text-headline-sm text-primary">ml</span>
              <span className="text-label text-outline mt-2">Target: {dailyTarget} ml</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary-container rounded-full">
            <span className="material-symbols-outlined text-on-secondary-container text-lg">auto_awesome</span>
            <span className="text-label text-on-secondary-container">Bagus! {Math.round(percentage)}% tercapai</span>
          </div>
        </div>

        {/* Quick Input */}
        <div className="mb-6">
          <h2 className="text-headline-sm text-on-surface mb-4 px-1">Input Cepat</h2>
          <div className="flex flex-wrap gap-3">
            {[
              { value: 60, selected: amount === '60' },
              { value: 90, selected: amount === '90' },
              { value: 120, selected: amount === '120' },
              { value: 150, selected: amount === '150' },
            ].map(({ value, selected }) => (
              <button
                key={value}
                type="button"
                onClick={() => quickInput(value)}
                className={`flex-1 min-w-[70px] h-14 rounded-full flex flex-col items-center justify-center transition-all ${selected ? 'btn-chip active' : 'btn-chip'}`}
              >
                <span className={`text-headline-sm ${selected ? 'text-on-primary-container' : 'text-primary'}`}>{value}</span>
                <span className={`text-label ${selected ? 'text-on-primary-container' : 'text-outline'}`}>ml</span>
              </button>
            ))}
            <button type="button" className="flex-[1.5] min-w-[90px] h-14 bg-surface-container rounded-full flex items-center justify-center gap-2 transition-all hover:bg-surface-container-high">
              <span className="material-symbols-outlined text-primary">edit</span>
              <span className="text-label text-on-surface">Custom</span>
            </button>
          </div>
        </div>

        {/* Input Form */}
        <div className="card p-6 mb-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="text-label text-on-surface-variant mb-2 block">Jumlah (ml)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input"
                placeholder="Masukkan jumlah ml"
                required min="1"
              />
            </div>
            <div className="mb-4">
              <label className="text-label text-on-surface-variant mb-2 block">Waktu</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="input"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-full py-4 text-lg">
              Simpan
            </button>
          </form>
        </div>

        {/* History */}
        <div className="mb-6">
          <div className="flex justify-between items-end mb-4 px-1">
            <h2 className="text-headline-sm text-on-surface">Riwayat Terbaru</h2>
            <Link href="/history" className="text-label text-primary hover:underline">Lihat Semua</Link>
          </div>

          <div className="space-y-3">
            {historyToday.length === 0 ? (
              <div className="card p-4 text-center">
                <p className="text-body text-on-surface-variant">Belum ada data hari ini</p>
              </div>
            ) : (
              historyToday.map((item, index) => (
                <div key={item.id} className={`card p-4 flex items-center border-l-4 ${index === 0 ? 'border-primary' : 'border-primary/40'}`}>
                  <div className="w-12 h-12 rounded-full bg-primary-container/30 flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="material-symbols-outlined text-primary">child_care</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-body text-on-surface">Susu Botol</p>
                    <p className="text-label text-outline">Pukul {item.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-headline-sm text-primary">{item.amount} ml</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* FAB */}
      <Link href="/history">
        <button className="fab">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'wght' 600" }}>add</span>
        </button>
      </Link>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <Link href="/" className="nav-item active">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          <span className="label">Home</span>
        </Link>
        <Link href="/history" className="nav-item">
          <span className="material-symbols-outlined">history</span>
          <span className="label">History</span>
        </Link>
        <Link href="/insights" className="nav-item">
          <span className="material-symbols-outlined">insights</span>
          <span className="label">Insights</span>
        </Link>
      </nav>

      {/* Toast */}
      {showToast && (
        <div className="toast">
          <span className="material-symbols-outlined text-on-tertiary-container">check_circle</span>
          <span className="text-body">Data berhasil disimpan!</span>
        </div>
      )}
    </div>
  );
}
