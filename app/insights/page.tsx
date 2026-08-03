'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MilkRecord, MpasiRecord, GrowthRecord, RecordType } from '@/lib/types';
import { getMilkRecords, getMpasiRecords, getGrowthRecords } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface DayData {
  date: string;
  total: number;
  count: number;
  avgPerSession: number;
}

interface MonthData {
  month: string;
  monthIndex: number;
  year: number;
  weight: number | null;
  height: number | null;
  date: string;
}

export default function Insights() {
  const [recordType, setRecordType] = useState<RecordType>('susu');
  const [data, setData] = useState<MilkRecord[]>([]);
  const [dataMpasi, setDataMpasi] = useState<MpasiRecord[]>([]);
  const [dataGrowth, setDataGrowth] = useState<GrowthRecord[]>([]);
  const [chartData, setChartData] = useState<DayData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);
  const [dateRange, setDateRange] = useState(7);
  const [dailyTarget, setDailyTarget] = useState(1000);
  const [dailyTargetMpasi, setDailyTargetMpasi] = useState(500);

  useEffect(() => {
    const savedTarget = localStorage.getItem('dailyTarget');
    const savedTargetMpasi = localStorage.getItem('dailyTargetMpasi');
    if (savedTarget) {
      setDailyTarget(parseInt(savedTarget));
    }
    if (savedTargetMpasi) {
      setDailyTargetMpasi(parseInt(savedTargetMpasi));
    }
    loadData();
  }, [dateRange, recordType]);

  const getTodayString = () => new Date().toISOString().split('T')[0];

  const loadData = async () => {
    try {
      if (recordType === 'susu') {
        const milkData = await getMilkRecords();
        setData(milkData);
        setDataMpasi([]);
        setDataGrowth([]);
        setMonthlyData([]);

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
      } else if (recordType === 'mpasi') {
        const mpasiData = await getMpasiRecords();
        setDataMpasi(mpasiData);
        setData([]);
        setDataGrowth([]);
        setMonthlyData([]);

        // Calculate data for selected range
        const days: DayData[] = [];
        for (let i = dateRange - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          const dayRecords = mpasiData.filter(item => item.date === dateStr);

          const total = dayRecords.reduce((sum, item) => sum + item.amount, 0);
          days.push({
            date: dateStr,
            total,
            count: dayRecords.length,
            avgPerSession: dayRecords.length > 0 ? Math.round(total / dayRecords.length) : 0
          });
        }
        setChartData(days);
      } else {
        // Growth - load all data and calculate monthly data
        const growthData = await getGrowthRecords();
        setDataGrowth(growthData);
        setData([]);
        setDataMpasi([]);
        setChartData([]);

        // Calculate monthly data from first record to now
        if (growthData.length > 0) {
          const sortedData = [...growthData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          const firstDate = new Date(sortedData[0].date);
          const today = new Date();

          // Create monthly data
          const monthly: MonthData[] = [];
          const currentDate = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);

          while (currentDate <= today) {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'][month];

            // Find records for this month
            const monthRecords = sortedData.filter(r => {
              const rDate = new Date(r.date);
              return rDate.getFullYear() === year && rDate.getMonth() === month;
            });

            if (monthRecords.length > 0) {
              // Get latest record for this month
              const latestInMonth = monthRecords[monthRecords.length - 1];
              monthly.push({
                month: monthName,
                monthIndex: month,
                year,
                weight: latestInMonth.weight,
                height: latestInMonth.height,
                date: latestInMonth.date
              });
            } else {
              monthly.push({
                month: monthName,
                monthIndex: month,
                year,
                weight: null,
                height: null,
                date: currentDate.toISOString().split('T')[0]
              });
            }

            currentDate.setMonth(currentDate.getMonth() + 1);
          }

          setMonthlyData(monthly);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const getDayName = (dateString: string) => {
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    return days[new Date(dateString).getDay()];
  };

  const getDayNumber = (dateString: string) => new Date(dateString).getDate();

  const currentTarget = recordType === 'susu' ? dailyTarget : dailyTargetMpasi;
  const maxTotal = Math.max(...chartData.map(d => d.total), currentTarget);

  // Calculate stats
  const totalConsumed = chartData.reduce((sum, d) => sum + d.total, 0);
  const avgDaily = chartData.length > 0 ? Math.round(totalConsumed / chartData.length) : 0;
  const daysTargetMet = chartData.filter(d => d.total >= currentTarget).length;
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
        <Link href="/" className="no-underline">
          <button className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
          </button>
        </Link>
        <h1 className="text-headline-sm text-primary font-quicksand">Wawasan</h1>
        <Link href="/settings" className="no-underline">
          <button className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">settings</span>
          </button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="app-content">
        {/* Record Type Toggle */}
        <div className="mb-6">
          <div className="flex bg-surface-container rounded-full p-1">
            <button
              type="button"
              onClick={() => setRecordType('susu')}
              className={`flex-1 py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-all ${
                recordType === 'susu'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined">local_drink</span>
              <span className="text-label font-medium">Susu</span>
            </button>
            <button
              type="button"
              onClick={() => setRecordType('mpasi')}
              className={`flex-1 py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-all ${
                recordType === 'mpasi'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined">restaurant</span>
              <span className="text-label font-medium">MPASI</span>
            </button>
            <button
              type="button"
              onClick={() => setRecordType('growth')}
              className={`flex-1 py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-all ${
                recordType === 'growth'
                  ? 'bg-tertiary text-on-tertiary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined">straighten</span>
              <span className="text-label font-medium">Growth</span>
            </button>
          </div>
        </div>

        {/* Date Range Selector - Only for Susu/MPASI */}
        {recordType !== 'growth' && (
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
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {recordType !== 'growth' ? (
            <>
              <div className={`card p-4 bg-gradient-to-br ${recordType === 'susu' ? 'from-primary/10 to-primary/5' : 'from-secondary/10 to-secondary/5'}`}>
                <div className={`w-10 h-10 rounded-full ${recordType === 'susu' ? 'bg-primary/20' : 'bg-secondary/20'} flex items-center justify-center mb-2`}>
                  <span className={`material-symbols-outlined ${recordType === 'susu' ? 'text-primary' : 'text-secondary'} text-lg`}>
                    {recordType === 'susu' ? 'local_drink' : 'restaurant'}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mb-0.5">Total Konsumsi</p>
                <p className={`text-lg font-bold ${recordType === 'susu' ? 'text-primary' : 'text-secondary'}`}>{totalConsumed} {recordType === 'susu' ? 'ml' : 'ml/gr'}</p>
              </div>
              <div className="card p-4 bg-gradient-to-br from-secondary/10 to-secondary/5">
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-secondary text-lg">straighten</span>
                </div>
                <p className="text-xs text-on-surface-variant mb-0.5">Rata-rata Harian</p>
                <p className="text-lg font-bold text-secondary">{avgDaily} {recordType === 'susu' ? 'ml' : 'ml/gr'}</p>
              </div>
              <div className="card p-4 bg-gradient-to-br from-tertiary/10 to-tertiary/5">
                <div className="w-10 h-10 rounded-full bg-tertiary/20 flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-tertiary text-lg">verified</span>
                </div>
                <p className="text-xs text-on-surface-variant mb-0.5">Target Tercapai</p>
                <p className="text-lg font-bold text-tertiary">{daysTargetMet} hari</p>
              </div>
              <div className="card p-4 bg-gradient-to-br from-surface-container/50 to-surface-container/30">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-on-surface text-lg">repeat</span>
                </div>
                <p className="text-xs text-on-surface-variant mb-0.5">Rata-rata/Sesi</p>
                <p className="text-lg font-bold text-on-surface">{avgPerSession} {recordType === 'susu' ? 'ml' : 'ml/gr'}</p>
              </div>
            </>
          ) : (
            <>
              <div className="card p-4 bg-gradient-to-br from-tertiary/10 to-tertiary/5">
                <div className="w-10 h-10 rounded-full bg-tertiary/20 flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-tertiary text-lg">fitness_center</span>
                </div>
                <p className="text-xs text-on-surface-variant mb-0.5">Berat Terakhir</p>
                <p className="text-lg font-bold text-tertiary">{dataGrowth.length > 0 ? dataGrowth[0].weight : 0} kg</p>
              </div>
              <div className="card p-4 bg-gradient-to-br from-tertiary/10 to-tertiary/5">
                <div className="w-10 h-10 rounded-full bg-tertiary/20 flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-tertiary text-lg">height</span>
                </div>
                <p className="text-xs text-on-surface-variant mb-0.5">Tinggi Terakhir</p>
                <p className="text-lg font-bold text-tertiary">{dataGrowth.length > 0 ? dataGrowth[0].height : 0} cm</p>
              </div>
              <div className="card p-4 bg-gradient-to-br from-surface-container/50 to-surface-container/30">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-on-surface text-lg">calendar_today</span>
                </div>
                <p className="text-xs text-on-surface-variant mb-0.5">Total Pengukuran</p>
                <p className="text-lg font-bold text-on-surface">{dataGrowth.length} kali</p>
              </div>
              <div className="card p-4 bg-gradient-to-br from-surface-container/50 to-surface-container/30">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-on-surface text-lg">trending_up</span>
                </div>
                <p className="text-xs text-on-surface-variant mb-0.5">Bulan Tercatat</p>
                <p className="text-lg font-bold text-on-surface">{monthlyData.filter(m => m.weight !== null).length} bulan</p>
              </div>
            </>
          )}
        </div>

        {/* Chart - Bar Chart for Susu/MPASI, Line Chart for Growth */}
        {recordType !== 'growth' ? (
          <div className="card p-5 mb-6">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-base font-semibold text-on-surface leading-tight">
                  Grafik Konsumsi {recordType === 'susu' ? 'Susu' : 'MPASI'}
                </h2>
                <p className="text-xs text-on-surface-variant leading-tight">Target: {currentTarget} {recordType === 'susu' ? 'ml' : 'ml/gr'}</p>
              </div>
            </div>

            {/* Vertical Bar Chart */}
            <div className="flex items-end justify-between gap-2 h-44 px-1">
              {chartData.map((day) => {
                const heightPercent = maxTotal > 0 ? (day.total / maxTotal) * 100 : 0;
                const metTarget = day.total >= currentTarget;
                const barHeight = Math.max(heightPercent, day.total > 0 ? 4 : 0);
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-label font-semibold text-on-surface">
                      {day.total > 0 ? day.total : '-'}
                    </span>
                    <div className="w-full relative bg-surface-container rounded-t-lg overflow-hidden" style={{ height: '140px' }}>
                      <div
                        className="absolute bottom-0 left-0 right-0 rounded-t-lg transition-all duration-300"
                        style={{
                          height: `${barHeight}%`,
                          background: metTarget
                            ? recordType === 'susu'
                              ? 'linear-gradient(to top, #2e6385, #a5d8ff)'
                              : 'linear-gradient(to top, #6d4c41, #ffab91)'
                            : recordType === 'susu'
                              ? 'linear-gradient(to top, rgba(46, 99, 133, 0.6), rgba(46, 99, 133, 0.4))'
                              : 'linear-gradient(to top, rgba(109, 76, 65, 0.6), rgba(109, 76, 65, 0.4))'
                        }}
                      />
                      {day.total > 0 && currentTarget > 0 && (
                        <div
                          className="absolute w-full h-0.5 bg-error z-10"
                          style={{ bottom: `${(currentTarget / maxTotal) * 100}%` }}
                        />
                      )}
                    </div>
                    <span className="text-xs text-on-surface-variant">
                      {dateRange <= 14 ? getDayName(day.date) : getDayNumber(day.date)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-surface-container">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${recordType === 'susu' ? 'bg-primary' : 'bg-secondary'}`} />
                <span className="text-label text-on-surface-variant">Tercapai</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${recordType === 'susu' ? 'bg-primary/60' : 'bg-secondary/60'}`} />
                <span className="text-label text-on-surface-variant">Belum Tercapai</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-error" />
                <span className="text-label text-on-surface-variant">Target</span>
              </div>
            </div>
          </div>
        ) : (
          // Growth Line Chart
          <div className="card p-5 mb-6">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-base font-semibold text-on-surface leading-tight">
                  Grafik Pertumbuhan
                </h2>
                <p className="text-xs text-on-surface-variant leading-tight">
                  {monthlyData.length > 0 ? `dari ${monthlyData[0].month} ${monthlyData[0].year}` : 'Belum ada data'}
                </p>
              </div>
            </div>

            {monthlyData.length > 0 ? (
              <>
                {/* Line Chart SVG */}
                <div className="relative h-48 mb-4">
                  <svg className="w-full h-full" viewBox="0 0 400 180" preserveAspectRatio="xMidYMid meet">
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line
                        key={`grid-${i}`}
                        x1="40"
                        y1={20 + i * 35}
                        x2="390"
                        y2={20 + i * 35}
                        stroke="var(--surface-container-high)"
                        strokeWidth="1"
                      />
                    ))}

                    {/* Weight Line - Blue */}
                    {monthlyData.filter(m => m.weight !== null).length > 1 && (
                      <>
                        <polyline
                          fill="none"
                          stroke="var(--primary)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={monthlyData
                            .filter(m => m.weight !== null)
                            .map((m, i, arr) => {
                              const x = 50 + (i / Math.max(arr.length - 1, 1)) * 330;
                              const weights = arr.filter(a => a.weight !== null).map(a => a.weight as number);
                              const minWeight = Math.min(...weights);
                              const maxWeight = Math.max(...weights);
                              const range = maxWeight - minWeight || 1;
                              const y = 150 - (((m.weight as number) - minWeight) / range) * 110;
                              return `${x},${y}`;
                            })
                            .join(' ')}
                        />
                        {/* Weight dots */}
                        {monthlyData
                          .filter(m => m.weight !== null)
                          .map((m, i, arr) => {
                            const x = 50 + (i / Math.max(arr.length - 1, 1)) * 330;
                            const weights = arr.filter(a => a.weight !== null).map(a => a.weight as number);
                            const minWeight = Math.min(...weights);
                            const maxWeight = Math.max(...weights);
                            const range = maxWeight - minWeight || 1;
                            const y = 150 - (((m.weight as number) - minWeight) / range) * 110;
                            return (
                              <circle key={`w-${m.date}`} cx={x} cy={y} r="4" fill="var(--primary)" />
                            );
                          })}
                      </>
                    )}

                    {/* Height Line - Tertiary (Green/Brown) */}
                    {monthlyData.filter(m => m.height !== null).length > 1 && (
                      <>
                        <polyline
                          fill="none"
                          stroke="var(--tertiary)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={monthlyData
                            .filter(m => m.height !== null)
                            .map((m, i, arr) => {
                              const x = 50 + (i / Math.max(arr.length - 1, 1)) * 330;
                              const heights = arr.filter(a => a.height !== null).map(a => a.height as number);
                              const minHeight = Math.min(...heights);
                              const maxHeight = Math.max(...heights);
                              const range = maxHeight - minHeight || 1;
                              const y = 150 - (((m.height as number) - minHeight) / range) * 110;
                              return `${x},${y}`;
                            })
                            .join(' ')}
                        />
                        {/* Height dots */}
                        {monthlyData
                          .filter(m => m.height !== null)
                          .map((m, i, arr) => {
                            const x = 50 + (i / Math.max(arr.length - 1, 1)) * 330;
                            const heights = arr.filter(a => a.height !== null).map(a => a.height as number);
                            const minHeight = Math.min(...heights);
                            const maxHeight = Math.max(...heights);
                            const range = maxHeight - minHeight || 1;
                            const y = 150 - (((m.height as number) - minHeight) / range) * 110;
                            return (
                              <circle key={`h-${m.date}`} cx={x} cy={y} r="4" fill="var(--tertiary)" />
                            );
                          })}
                      </>
                    )}
                  </svg>
                </div>

                {/* X-axis labels */}
                <div className="flex justify-between px-4 mb-4">
                  {monthlyData.filter(m => m.weight !== null || m.height !== null).map((m, i, arr) => {
                    if (arr.length <= 6 || i === 0 || i === arr.length - 1 || i % Math.ceil(arr.length / 4) === 0) {
                      return (
                        <span key={m.date} className="text-xs text-on-surface-variant">
                          {m.month}
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 pt-4 border-t border-surface-container">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-primary" />
                    <span className="text-label text-on-surface-variant">Berat (kg)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-tertiary" />
                    <span className="text-label text-on-surface-variant">Tinggi (cm)</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-on-surface-variant text-5xl mb-3">show_chart</span>
                <p className="text-body text-on-surface-variant">Belum ada data pertumbuhan</p>
              </div>
            )}
          </div>
        )}

        {/* Daily Details */}
        <div className="card p-6">
          <h2 className="text-headline-sm text-on-surface mb-4">
            {recordType === 'growth' ? 'Riwayat Pertumbuhan' : 'Detail Harian'}
          </h2>

          {recordType === 'growth' ? (
            dataGrowth.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-on-surface-variant text-5xl mb-3">straighten</span>
                <p className="text-body text-on-surface-variant">Belum ada data untuk ditampilkan</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto hide-scrollbar">
                {dataGrowth.map((record) => (
                  <div key={record.id} className="p-4 rounded-xl bg-tertiary-container/20">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-tertiary">calendar_today</span>
                      </div>
                      <div>
                        <p className="text-body text-on-surface font-semibold">{formatDate(record.date)}</p>
                        <p className="text-label text-outline">Pengukuran #{dataGrowth.findIndex(r => r.id === record.id) + 1}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-surface-container rounded-xl p-3 text-center">
                        <span className="material-symbols-outlined text-primary text-lg">fitness_center</span>
                        <p className="text-headline-sm text-tertiary mt-1">{record.weight} kg</p>
                      </div>
                      <div className="bg-surface-container rounded-xl p-3 text-center">
                        <span className="material-symbols-outlined text-tertiary text-lg">height</span>
                        <p className="text-headline-sm text-tertiary mt-1">{record.height} cm</p>
                      </div>
                    </div>
                    {record.notes && (
                      <div className="mt-3 p-3 bg-surface-container rounded-xl">
                        <p className="text-label text-on-surface-variant">{record.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : chartData.length === 0 || chartData.every(d => d.total === 0) ? (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-on-surface-variant text-5xl mb-3">bar_chart</span>
              <p className="text-body text-on-surface-variant">Belum ada data untuk ditampilkan</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto hide-scrollbar">
              {[...chartData].reverse().map((day) => {
                const metTarget = day.total >= currentTarget;
                return (
                  <div
                    key={day.date}
                    className={`p-4 rounded-xl flex items-center justify-between ${
                      metTarget ? (recordType === 'susu' ? 'bg-primary-container/30' : 'bg-secondary-container/30') : 'bg-surface-container'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        metTarget ? (recordType === 'susu' ? 'bg-primary-container' : 'bg-secondary-container') : 'bg-surface-container-high'
                      }`}>
                        <span className={`material-symbols-outlined ${metTarget ? (recordType === 'susu' ? 'text-primary' : 'text-secondary') : 'text-on-surface-variant'}`}>
                          {metTarget ? 'check_circle' : 'schedule'}
                        </span>
                      </div>
                      <div>
                        <p className="text-body text-on-surface">{formatDate(day.date)}</p>
                        <p className="text-label text-outline">{day.count} sesi {recordType === 'susu' ? 'minum' : 'makan'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-headline-sm ${metTarget ? (recordType === 'susu' ? 'text-primary' : 'text-secondary') : 'text-on-surface'}`}>
                        {day.total} {recordType === 'susu' ? 'ml' : 'ml/gr'}
                      </p>
                      <p className={`text-label ${metTarget ? (recordType === 'susu' ? 'text-primary' : 'text-secondary') : 'text-outline'}`}>
                        {Math.round((day.total / currentTarget) * 100)}% dari target
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Weekly/Monthly Summary */}
        <div className="card p-6 mt-6">
          <h2 className="text-headline-sm text-on-surface mb-4">
            {recordType === 'growth' ? 'Ringkasan Pertumbuhan' : 'Ringkasan Mingguan'}
          </h2>

          {recordType === 'growth' ? (
            <div className="space-y-4">
              {/* Latest vs First */}
              {dataGrowth.length >= 2 && (
                <div className="flex items-center gap-3 p-3 bg-tertiary-container/30 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-tertiary">trending_up</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-label text-on-surface-variant">Perubahan Total</p>
                    <p className="text-body text-on-surface">
                      Berat: {dataGrowth[0].weight - dataGrowth[dataGrowth.length - 1].weight > 0 ? '+' : ''}{(dataGrowth[0].weight - dataGrowth[dataGrowth.length - 1].weight).toFixed(2)} kg
                    </p>
                    <p className="text-body text-on-surface">
                      Tinggi: {dataGrowth[0].height - dataGrowth[dataGrowth.length - 1].height > 0 ? '+' : ''}{(dataGrowth[0].height - dataGrowth[dataGrowth.length - 1].height).toFixed(1)} cm
                    </p>
                  </div>
                </div>
              )}

              {/* Best Weight */}
              {dataGrowth.length > 0 && (
                <div className="flex items-center gap-3 p-3 bg-surface-container rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">fitness_center</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-label text-on-surface-variant">Berat Tertinggi</p>
                    <p className="text-body text-on-surface">{Math.max(...dataGrowth.map(r => r.weight))} kg</p>
                    <p className="text-label text-outline">{formatDate(dataGrowth.find(r => r.weight === Math.max(...dataGrowth.map(r => r.weight)))?.date || '')}</p>
                  </div>
                </div>
              )}

              {/* Best Height */}
              {dataGrowth.length > 0 && (
                <div className="flex items-center gap-3 p-3 bg-surface-container rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary">height</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-label text-on-surface-variant">Tinggi Tertinggi</p>
                    <p className="text-body text-on-surface">{Math.max(...dataGrowth.map(r => r.height))} cm</p>
                    <p className="text-label text-outline">{formatDate(dataGrowth.find(r => r.height === Math.max(...dataGrowth.map(r => r.height)))?.date || '')}</p>
                  </div>
                </div>
              )}

              {/* Recommendation */}
              <div className="p-4 bg-tertiary-container/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-tertiary text-xl">lightbulb</span>
                  <div>
                    <p className="text-label text-on-surface font-semibold mb-1">Saran</p>
                    <p className="text-sm text-on-surface-variant">
                      {dataGrowth.length === 0
                        ? 'Mulai catat pertumbuhan Qila secara rutin untuk melihat perkembangan.'
                        : dataGrowth.length < 3
                        ? 'Terus catat pertumbuhan Qila secara rutin untuk data yang lebih akurat.'
                        : 'Pertumbuhan Qila terlihat baik! Lanjutkan pemantauan rutin.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Best Day */}
              {(() => {
                const best = chartData.reduce((max, day) => day.total > max.total ? day : max, chartData[0]);
                return best && best.total > 0 ? (
                  <div className={`flex items-center gap-3 p-3 rounded-xl ${recordType === 'susu' ? 'bg-primary-container/30' : 'bg-secondary-container/30'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${recordType === 'susu' ? 'bg-primary-container' : 'bg-secondary-container'}`}>
                      <span className={`material-symbols-outlined ${recordType === 'susu' ? 'text-primary' : 'text-secondary'}`}>emoji_events</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-label text-on-surface-variant">Hari Tertinggi</p>
                      <p className="text-body text-on-surface">{formatDate(best.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-headline-sm ${recordType === 'susu' ? 'text-primary' : 'text-secondary'}`}>{best.total} {recordType === 'susu' ? 'ml' : 'ml/gr'}</p>
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
                      {avgDaily < currentTarget * 0.7
                        ? `Coba tingkatkan frekuensi ${recordType === 'susu' ? 'minum Qila' : 'makan MPASI Qila'} agar lebih dekat dengan target harian.`
                        : avgDaily >= currentTarget
                        ? 'Bagus! Qila sudah mencapai target harian. Pertahankan pola ini!'
                        : 'Qila sudah di jalur yang baik. Sedikit lagi untuk mencapai target!'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <Link href="/" className="nav-item">
          <span className="material-symbols-outlined">home</span>
          <span className="label">Home</span>
        </Link>
        <Link href="/growth" className="nav-item">
          <span className="material-symbols-outlined">straighten</span>
          <span className="label">Growth</span>
        </Link>
        <Link href="/history" className="nav-item">
          <span className="material-symbols-outlined">history</span>
          <span className="label">History</span>
        </Link>
        <Link href="/insights" className="nav-item active">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
          <span className="label">Insights</span>
        </Link>
      </nav>
    </div>
  );
}
