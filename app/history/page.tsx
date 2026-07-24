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
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="card p-4 bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary text-lg">local_drink</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-on-surface-variant mb-0.5">Rata-rata</p>
                <p className="text-lg font-bold text-primary">{getWeeklyAverage()} ml</p>
              </div>
            </div>
          </div>
          <div className="card p-4 bg-gradient-to-br from-tertiary/10 to-tertiary/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-tertiary/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-tertiary text-lg">today</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-on-surface-variant mb-0.5">Hari Ini</p>
                <p className="text-lg font-bold text-tertiary">{getDailyTotal(today)} ml</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="card p-5 mb-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-on-surface leading-tight">Tren 7 Hari</h2>
            <p className="text-xs text-on-surface-variant leading-tight">Konsumsi harian Anda</p>
          </div>

          <div className="flex items-end justify-between h-40 gap-2">
            {last7Days.map((date) => {
              const total = getDailyTotal(date);
              const heightPercent = (total / maxTotal) * 100;
              const isToday = date === today;
              return (
                <div key={date} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-label text-on-surface-variant group-hover:text-primary transition-colors">
                    {total > 0 ? total : ''}
                  </span>
                  <div className="w-full bg-surface-container-highest rounded-lg relative flex items-end overflow-hidden" style={{ height: `${Math.max(heightPercent, 8)}%`, minHeight: '8px' }}>
                    <div className={`w-full rounded-lg transition-all ${isToday ? 'bg-gradient-to-t from-primary to-primary-container' : 'bg-gradient-to-t from-primary/60 to-primary/40'}`} 
                         style={{ height: '100%' }} />
                  </div>
                  <span className={`text-label ${isToday ? 'text-primary font-semibold' : 'text-on-surface-variant'}`}>
                    {getDayName(date).slice(0, 3)}
                  </span>
                </div>
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
        <div className="space-y-4">
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
                <div key={date} className="mb-6">
                  <div className="flex justify-between items-center mb-3 px-1">
                    <h3 className="text-title-md text-on-surface font-semibold">{formatDate(date)}</h3>
                    <span className="bg-secondary-container text-on-secondary-container px-4 py-1.5 rounded-full text-label font-medium">{total} ml</span>
                  </div>
                  <div className="space-y-2">
                    {items.map(item => (
                      <div
                        key={item.id}
                        className="card p-4 flex items-center justify-between hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                            <span className="material-symbols-outlined text-xl">water_drop</span>
                          </div>
                          <div>
                            <p className="text-body-lg text-on-surface font-medium">{item.amount} ml</p>
                            <p className="text-label text-on-surface-variant">{item.time}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setDeleteId(item.id)}
                          className="text-error p-2 hover:bg-error/10 rounded-full transition-all"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
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
