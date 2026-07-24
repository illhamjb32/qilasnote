'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MilkRecord } from '@/lib/types';
import { getMilkRecords, getMilkRecordsByDateRange, deleteMilkRecord } from '@/lib/db';

// Disable static prerendering - this page uses localStorage which isn't available on server
export const dynamic = 'force-dynamic';

export default function History() {
  const [currentFilter, setCurrentFilter] = useState('today');
  const [groupedData, setGroupedData] = useState<Record<string, MilkRecord[]>>({});
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    loadAndRenderHistory();
  }, [currentFilter]);

  const getTodayString = () => new Date().toISOString().split('T')[0];

  const getWeekStart = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff)).toISOString().split('T')[0];
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const filterData = async () => {
    const today = getTodayString();
    const weekStart = getWeekStart();
    
    if (currentFilter === 'today') {
      return await getMilkRecordsByDateRange(today);
    } else if (currentFilter === 'week') {
      return await getMilkRecordsByDateRange(weekStart);
    } else {
      return await getMilkRecords();
    }
  };

  const loadAndRenderHistory = async () => {
    try {
      const data = await filterData();
      const groups: Record<string, MilkRecord[]> = {};
      data.forEach(item => {
        if (!groups[item.date]) groups[item.date] = [];
        groups[item.date].push(item);
      });
      Object.keys(groups).forEach(date => {
        groups[date].sort((a, b) => b.time.localeCompare(a.time));
      });
      setGroupedData(groups);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  };

  const getDayName = (dateString: string) => {
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    return days[new Date(dateString).getDay()];
  };

  const handleDelete = async () => {
    if (deleteId !== null) {
      try {
        await deleteMilkRecord(deleteId);
        setDeleteId(null);
        await loadAndRenderHistory();
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      } catch (error) {
        console.error('Error deleting record:', error);
        alert('Gagal menghapus data. Silakan coba lagi.');
      }
    }
  };

  const sortedDates = Object.keys(groupedData).sort().reverse();
  const last7Days = getLast7Days();
  const today = getTodayString();

  const getWeeklyAverage = () => {
    if (typeof window === 'undefined') return 0;
    const weekStart = getWeekStart();
    const data: MilkRecord[] = JSON.parse(localStorage.getItem('milkData') || '[]');
    const weekData = data.filter(item => item.date >= weekStart);
    const total = weekData.reduce((sum, item) => sum + item.amount, 0);
    const daysWithData = new Set(weekData.map(item => item.date)).size;
    return daysWithData > 0 ? Math.round(total / daysWithData) : 0;
  };

  const getDailyTotal = (date: string) => {
    if (typeof window === 'undefined') return 0;
    const data: MilkRecord[] = JSON.parse(localStorage.getItem('milkData') || '[]');
    return data.filter(item => item.date === date).reduce((sum, item) => sum + item.amount, 0);
  };

  const maxTotal = typeof window !== 'undefined' ? Math.max(...last7Days.map(d => getDailyTotal(d)), 1000) : 1000;

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <Link href="/">
          <button className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
          </button>
        </Link>
        <h1 className="text-headline-sm text-primary font-quicksand">Riwayat Minum</h1>
        <Link href="/settings">
          <button className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">settings</span>
          </button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="app-content">
        {/* Chart */}
        <div className="card p-6 mb-6">
          <div className="flex justify-between items-end mb-6">
            <div>
              <p className="text-label text-on-surface-variant uppercase tracking-wider mb-1">Tren Konsumsi</p>
              <h2 className="text-headline text-primary">5 Hari Terakhir</h2>
            </div>
            <div className="text-right">
              <span className="text-label text-on-surface-variant">Rata-rata</span>
              <p className="text-headline text-on-surface">{getWeeklyAverage()}<span className="text-body text-on-surface-variant ml-1">ml</span></p>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end justify-between h-32 gap-3 px-2">
            {last7Days.slice(-5).map((date) => {
              const total = getDailyTotal(date);
              const heightPercent = (total / maxTotal) * 100;
              const isToday = date === today;
              return (
                <div key={date} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full bg-primary-container/30 rounded-t-full relative flex items-end overflow-hidden" style={{ height: `${Math.max(heightPercent, 5)}%` }}>
                    <div className={`w-full rounded-t-full h-full ${isToday ? 'bg-primary-fixed-dim' : 'bg-primary'}`} />
                  </div>
                  <span className={`text-label ${isToday ? 'text-primary font-bold' : 'text-outline group-hover:text-primary'}`}>
                    {new Date(date).getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Calendar Strip */}
        <div className="-mx-6 px-6 mb-6">
          <div className="flex overflow-x-auto hide-scrollbar gap-4 py-2">
            {last7Days.map((date) => {
              const isToday = date === today;
              return (
                <button
                  key={date}
                  className={`flex flex-col items-center justify-center min-w-[64px] h-20 rounded-lg transition-colors ${isToday ? 'bg-primary-container text-on-primary-container ring-2 ring-primary ring-offset-2' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'}`}
                >
                  <span className="text-label opacity-70">{getDayName(date)}</span>
                  <span className="text-headline-sm">{new Date(date).getDate()}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-6">
          {[
            { filter: 'today', label: 'Hari Ini' },
            { filter: 'week', label: 'Minggu Ini' },
            { filter: 'all', label: 'Semua' }
          ].map(({ filter, label }) => (
            <button
              key={filter}
              onClick={() => setCurrentFilter(filter)}
              className={`flex-1 py-3 rounded-full font-semibold text-label transition-all ${currentFilter === filter ? 'btn-chip active' : 'btn-chip'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* History List */}
        <div className="space-y-6">
          {sortedDates.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-on-surface-variant text-4xl">history</span>
              </div>
              <p className="text-body text-on-surface-variant">Belum ada data</p>
              <p className="text-label text-outline mt-1">Mulai catat minum susu Qila</p>
            </div>
          ) : (
            sortedDates.map(date => {
              const items = groupedData[date];
              const total = items.reduce((sum, item) => sum + item.amount, 0);
              return (
                <div key={date}>
                  <div className="flex justify-between items-center mb-4 px-2">
                    <h3 className="text-headline-sm text-on-surface">{formatDate(date)}</h3>
                    <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-label">Total {total} ml</span>
                  </div>
                  <div className="card divide-y divide-surface-container-high/30">
                    {items.map(item => (
                      <div
                        key={item.id}
                        className="p-4 flex items-center justify-between hover:bg-surface-container-high/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-primary flex-shrink-0">
                            <span className="material-symbols-outlined">baby_changing_station</span>
                          </div>
                          <div>
                            <p className="text-body text-on-surface">Susu Formula</p>
                            <p className="text-label text-outline">Pukul {item.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-headline-sm text-primary">{item.amount}<span className="text-sm font-medium ml-0.5">ml</span></p>
                          <button
                            onClick={() => setDeleteId(item.id)}
                            className="text-error p-2 hover:bg-error-container rounded-full transition-all"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <Link href="/" className="nav-item">
          <span className="material-symbols-outlined">home</span>
          <span className="label">Home</span>
        </Link>
        <Link href="/history" className="nav-item active">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
          <span className="label">History</span>
        </Link>
        <Link href="/insights" className="nav-item">
          <span className="material-symbols-outlined">insights</span>
          <span className="label">Insights</span>
        </Link>
      </nav>

      {/* Delete Modal */}
      {deleteId !== null && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="text-headline text-on-surface mb-4">Hapus Data?</h3>
            <p className="text-body text-on-surface-variant mb-4">Data yang dihapus tidak dapat dikembalikan.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3 bg-surface-container text-on-surface rounded-full font-semibold transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-error text-on-error rounded-full font-semibold transition-all"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className="toast">
          <span className="material-symbols-outlined text-on-tertiary-container">check_circle</span>
          <span className="text-body">Data berhasil dihapus!</span>
        </div>
      )}
    </div>
  );
}
