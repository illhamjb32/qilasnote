'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MilkRecord } from '@/lib/types';
import { getMilkRecords } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface DayData {
  date: string;
  total: number;
  count: number;
  avgPerSession: number;
}

export default function Insights() {
  const [data, setData] = useState<MilkRecord[]>([]);
  const [chartData, setChartData] = useState<DayData[]>([]);
  const [dateRange, setDateRange] = useState(7); // 7, 14, 30 days
  const [dailyTarget, setDailyTarget] = useState(1000);

  useEffect(() => {
    const savedTarget = localStorage.getItem('dailyTarget');
    if (savedTarget) {
      setDailyTarget(parseInt(savedTarget));
    }
    loadData();
  }, [dateRange]);

  const getTodayString = () => new Date().toISOString().split('T')[0];

  const loadData = async () => {
    try {
      const milkData = await getMilkRecords();
      setData(milkData);

      // Calculate data for selected range
      const days: DayData[] = [];
      for (let i = dateRange - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayRecords = milkData.filter(item => item.date === dateStr);

        const total = dayRecords.reduce((sum, item) => sum + item.amount, 0);
        days.push({
          date: dateStr,
          total,
          count: dayRecords.length,
          avgPerSession: dayRecords.length > 0 ? Math.round(total / dayRecords.length) : 0
        });
      }
      setChartData(days);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const getDayName = (dateString: string) => {
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    return days[new Date(dateString).getDay()];
  };

  const getDayNumber = (dateString: string) => new Date(dateString).getDate();

  const maxTotal = Math.max(...chartData.map(d => d.total), dailyTarget);

  // Calculate stats
  const totalConsumed = chartData.reduce((sum, d) => sum + d.total, 0);
  const avgDaily = chartData.length > 0 ? Math.round(totalConsumed / chartData.length) : 0;
  const daysTargetMet = chartData.filter(d => d.total >= dailyTarget).length;
  const totalSessions = chartData.reduce((sum, d) => sum + d.count, 0);
  const avgPerSession = totalSessions > 0 ? Math.round(totalConsumed / totalSessions) : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <Link href="/">
          <button className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
          </button>
        </Link>
        <h1 className="text-headline-sm text-primary font-quicksand">Wawasan</h1>
        <Link href="/settings">
          <button className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">settings</span>
          </button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="app-content">
        {/* Date Range Selector */}
        <div className="flex gap-2 mb-6">
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              onClick={() => setDateRange(days)}
              className={`flex-1 py-3 rounded-full font-semibold text-label transition-all ${
                dateRange === days
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {days} Hari
            </button>
          ))}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="card p-5 bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-primary text-xl">water_drop</span>
            </div>
            <p className="text-label text-on-surface-variant mb-1">Total Konsumsi</p>
            <p className="text-title-md text-primary font-semibold">{totalConsumed} ml</p>
          </div>
          <div className="card p-5 bg-gradient-to-br from-secondary/10 to-secondary/5">
            <div className="w-11 h-11 rounded-full bg-secondary/20 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-secondary text-xl">straighten</span>
            </div>
            <p className="text-label text-on-surface-variant mb-1">Rata-rata Harian</p>
            <p className="text-title-md text-secondary font-semibold">{avgDaily} ml</p>
          </div>
          <div className="card p-5 bg-gradient-to-br from-tertiary/10 to-tertiary/5">
            <div className="w-11 h-11 rounded-full bg-tertiary/20 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-tertiary text-xl">verified</span>
            </div>
            <p className="text-label text-on-surface-variant mb-1">Target Tercapai</p>
            <p className="text-title-md text-tertiary font-semibold">{daysTargetMet} hari</p>
          </div>
          <div className="card p-5 bg-gradient-to-br from-surface-container/50 to-surface-container/30">
            <div className="w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-on-surface text-xl">repeat</span>
            </div>
            <p className="text-label text-on-surface-variant mb-1">Rata-rata/Sesi</p>
            <p className="text-title-md text-on-surface font-semibold">{avgPerSession} ml</p>
          </div>
        </div>

        {/* Chart */}
        <div className="card p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-headline-sm text-on-surface">Grafik Konsumsi</h2>
            <span className="text-label text-on-surface-variant">Target: {dailyTarget} ml</span>
          </div>

          {/* Bar Chart */}
          <div className="relative">
            {/* Target Line */}
            <div
              className="absolute left-0 right-0 border-t-2 border-dashed border-error z-10"
              style={{ bottom: `${(dailyTarget / maxTotal) * 100}%` }}
            >
              <span className="absolute -top-5 right-0 text-xs text-error font-semibold">{dailyTarget} ml</span>
            </div>

            <div className="flex items-end justify-between h-48 gap-1 px-1">
              {chartData.map((day, index) => {
                const heightPercent = (day.total / maxTotal) * 100;
                const metTarget = day.total >= dailyTarget;
                return (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center group relative"
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-3 py-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                      <p className="font-semibold">{day.total} ml</p>
                      <p className="text-xs opacity-70">{day.count} sesi</p>
                    </div>

                    {/* Bar */}
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        metTarget
                          ? 'bg-primary'
                          : day.total > 0
                          ? 'bg-primary/60'
                          : 'bg-surface-container'
                      }`}
                      style={{ height: `${Math.max(heightPercent, day.total > 0 ? 5 : 0)}%` }}
                    />
                    {/* Day Label */}
                    <span className="text-xs text-outline mt-2">
                      {dateRange <= 14 ? getDayName(day.date) : getDayNumber(day.date)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-surface-container">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-label text-on-surface-variant">Tercapai</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary/60" />
              <span className="text-label text-on-surface-variant">Belum Tercapai</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-error" />
              <span className="text-label text-on-surface-variant">Target</span>
            </div>
          </div>
        </div>

        {/* Daily Details */}
        <div className="card p-6">
          <h2 className="text-headline-sm text-on-surface mb-4">Detail Harian</h2>

          {chartData.length === 0 || chartData.every(d => d.total === 0) ? (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-on-surface-variant text-5xl mb-3">bar_chart</span>
              <p className="text-body text-on-surface-variant">Belum ada data untuk ditampilkan</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto hide-scrollbar">
              {[...chartData].reverse().map((day) => {
                const metTarget = day.total >= dailyTarget;
                return (
                  <div
                    key={day.date}
                    className={`p-4 rounded-xl flex items-center justify-between ${
                      metTarget ? 'bg-primary-container/30' : 'bg-surface-container'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        metTarget ? 'bg-primary-container' : 'bg-surface-container-high'
                      }`}>
                        <span className={`material-symbols-outlined ${metTarget ? 'text-primary' : 'text-on-surface-variant'}`}>
                          {metTarget ? 'check_circle' : 'schedule'}
                        </span>
                      </div>
                      <div>
                        <p className="text-body text-on-surface">{formatDate(day.date)}</p>
                        <p className="text-label text-outline">{day.count} sesi minum</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-headline-sm ${metTarget ? 'text-primary' : 'text-on-surface'}`}>
                        {day.total} ml
                      </p>
                      <p className={`text-label ${metTarget ? 'text-primary' : 'text-outline'}`}>
                        {Math.round((day.total / dailyTarget) * 100)}% dari target
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Weekly Summary */}
        <div className="card p-6 mt-6">
          <h2 className="text-headline-sm text-on-surface mb-4">Ringkasan Mingguan</h2>

          <div className="space-y-4">
            {/* Best Day */}
            {(() => {
              const best = chartData.reduce((max, day) => day.total > max.total ? day : max, chartData[0]);
              return best && best.total > 0 ? (
                <div className="flex items-center gap-3 p-3 bg-primary-container/30 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">emoji_events</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-label text-on-surface-variant">Hari Tertinggi</p>
                    <p className="text-body text-on-surface">{formatDate(best.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-headline-sm text-primary">{best.total} ml</p>
                    <p className="text-label text-outline">{best.count} sesi</p>
                  </div>
                </div>
              ) : null;
            })()}

            {/* Consistency */}
            <div className="flex items-center gap-3 p-3 bg-surface-container rounded-xl">
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary">trending_up</span>
              </div>
              <div className="flex-1">
                <p className="text-label text-on-surface-variant">Konsistensi</p>
                <p className="text-body text-on-surface">
                  {Math.round((daysTargetMet / chartData.filter(d => d.total > 0).length) * 100) || 0}% target tercapai
                </p>
              </div>
              <div className="w-16 h-16 relative">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="var(--surface-container-high)" strokeWidth="6" />
                  <circle
                    cx="32" cy="32" r="28" fill="none"
                    stroke="var(--secondary)"
                    strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - (daysTargetMet / Math.max(chartData.filter(d => d.total > 0).length, 1)))}`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-label text-secondary font-bold">
                  {Math.round((daysTargetMet / Math.max(chartData.filter(d => d.total > 0).length, 1)) * 100) || 0}%
                </span>
              </div>
            </div>

            {/* Recommendation */}
            <div className="p-4 bg-tertiary-container/30 rounded-xl">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-tertiary text-xl">lightbulb</span>
                <div>
                  <p className="text-label text-on-surface font-semibold mb-1">Saran</p>
                  <p className="text-sm text-on-surface-variant">
                    {avgDaily < dailyTarget * 0.7
                      ? 'Coba tingkatkan frekuensi minum Qila agar lebih dekat dengan target harian.'
                      : avgDaily >= dailyTarget
                      ? 'Bagus! Qila sudah mencapai target harian. Pertahankan pola ini!'
                      : 'Qila sudah di jalur yang baik. Sedikit lagi untuk mencapai target!'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
