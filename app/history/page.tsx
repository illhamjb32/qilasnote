'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { MilkRecord, MpasiRecord, RecordType, AdditionalFood } from '@/lib/types';
import { getMilkRecordsByDate, deleteMilkRecord, updateMilkRecord, getMpasiRecordsByDate, deleteMpasiRecord, updateMpasiRecord, getAdditionalFoodByDate } from '@/lib/db';

// Disable static prerendering - this page uses localStorage which isn't available on server
export const dynamic = 'force-dynamic';

export default function History() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [recordType, setRecordType] = useState<RecordType>('susu');
  const [records, setRecords] = useState<MilkRecord[]>([]);
  const [recordsMpasi, setRecordsMpasi] = useState<MpasiRecord[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [dailyTarget, setDailyTarget] = useState(1000);
  const [dailyTargetMpasi, setDailyTargetMpasi] = useState(500);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);
  const [additionalFoods, setAdditionalFoods] = useState<AdditionalFood[]>([]);

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
  }, [selectedDate, recordType]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  const loadData = async () => {
    try {
      if (recordType === 'susu') {
        const data = await getMilkRecordsByDate(selectedDate);
        data.sort((a, b) => b.time.localeCompare(a.time));
        setRecords(data);
      } else {
        const data = await getMpasiRecordsByDate(selectedDate);
        data.sort((a, b) => b.time.localeCompare(a.time));
        setRecordsMpasi(data);
        
        const additionalData = await getAdditionalFoodByDate(selectedDate);
        setAdditionalFoods(additionalData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const formatDateDisplay = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (dateString === today) return 'Hari Ini';
    if (dateString === yesterday) return 'Kemarin';

    const date = new Date(dateString);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  };

  const formatDateInput = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const goToPreviousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    const todayStr = new Date().toISOString().split('T')[0];
    if (date.toISOString().split('T')[0] <= todayStr) {
      setSelectedDate(date.toISOString().split('T')[0]);
    }
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setCalendarMonth(new Date());
    setShowCalendar(false);
  };

  // Calendar functions
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days: (number | null)[] = [];

    // Empty slots for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const selectDate = (day: number) => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const newDate = new Date(year, month, day);
    const dateStr = newDate.toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];

    if (dateStr <= todayStr) {
      setSelectedDate(dateStr);
      setShowCalendar(false);
    }
  };

  const goToPreviousMonth = () => {
    const newMonth = new Date(calendarMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCalendarMonth(newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = new Date(calendarMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    const today = new Date();
    if (newMonth.getFullYear() < today.getFullYear() ||
        (newMonth.getFullYear() === today.getFullYear() && newMonth.getMonth() <= today.getMonth())) {
      setCalendarMonth(newMonth);
    }
  };

  const handleDelete = async () => {
    if (deleteId !== null) {
      try {
        if (recordType === 'susu') {
          await deleteMilkRecord(deleteId);
        } else {
          await deleteMpasiRecord(deleteId);
        }
        setDeleteId(null);
        await loadData();
        setToastMessage('Data berhasil dihapus!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      } catch (error) {
        console.error('Error deleting record:', error);
        alert('Gagal menghapus data. Silakan coba lagi.');
      }
    }
  };

  const handleEdit = (record: MilkRecord | MpasiRecord) => {
    setEditId(record.id);
    setEditAmount(record.amount.toString());
  };

  const handleSaveEdit = async () => {
    if (editId !== null && editAmount) {
      try {
        const amount = parseInt(editAmount);
        if (isNaN(amount) || amount <= 0) {
          alert('Jumlah harus berupa angka positif');
          return;
        }
        if (recordType === 'susu') {
          await updateMilkRecord(editId, { amount });
        } else {
          await updateMpasiRecord(editId, { amount });
        }
        setEditId(null);
        setEditAmount('');
        await loadData();
        setToastMessage('Data berhasil diupdate!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      } catch (error) {
        console.error('Error updating record:', error);
        alert('Gagal mengupdate data. Silakan coba lagi.');
      }
    }
  };

  const getDailyTotal = () => {
    if (recordType === 'susu') {
      return records.reduce((sum, item) => sum + item.amount, 0);
    } else {
      return recordsMpasi.reduce((sum, item) => sum + item.amount, 0);
    }
  };

  const currentTarget = recordType === 'susu' ? dailyTarget : dailyTargetMpasi;
  const currentRecords = recordType === 'susu' ? records : recordsMpasi;
  const barMaxAmount = recordType === 'susu' ? 300 : 100;
  const maxAmount = currentRecords.length > 0 ? Math.max(...currentRecords.map(i => i.amount), barMaxAmount) : barMaxAmount;
  const totalAmount = getDailyTotal();
  const progressPercent = Math.min((totalAmount / currentTarget) * 100, 100);

  const today = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === today;

  const calendarDays = generateCalendarDays();
  const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  return (
    <div className="app-container">
      <header className="app-header">
        <Link href="/" className="no-underline">
          <button className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
          </button>
        </Link>
        <h1 className="text-headline-sm text-primary font-quicksand">Riwayat</h1>
        <Link href="/settings" className="no-underline">
          <button className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">settings</span>
          </button>
        </Link>
      </header>

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
              <span className="material-symbols-outlined">{recordType === 'susu' ? 'local_drink' : 'local_drink'}</span>
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
          </div>
        </div>

        {/* Date Selector */}
        <div className="card p-4 mb-6">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={goToPreviousDay}
              className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant">chevron_left</span>
            </button>

            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-surface-container hover:bg-surface-container-high rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined text-primary">calendar_month</span>
              <div className="text-center">
                <span className="text-body font-semibold text-on-surface block">{formatDateDisplay(selectedDate)}</span>
                <span className="text-label text-on-surface-variant">{formatDateInput(selectedDate)}</span>
              </div>
            </button>

            <button
              onClick={goToNextDay}
              disabled={isToday}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isToday
                  ? 'bg-surface-container/50 cursor-not-allowed'
                  : 'bg-surface-container hover:bg-surface-container-high'
              }`}
            >
              <span className={`material-symbols-outlined ${isToday ? 'text-outline' : 'text-on-surface-variant'}`}>chevron_right</span>
            </button>
          </div>

          {/* Custom Calendar Dropdown */}
          {showCalendar && (
            <div ref={calendarRef} className="mt-4 pt-4 border-t border-outline-variant">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={goToPreviousMonth}
                  className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined text-on-surface-variant">chevron_left</span>
                </button>
                <span className="text-body font-semibold text-on-surface">
                  {calendarMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={goToNextMonth}
                  className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="mb-3">
                {/* Week day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDays.map(day => (
                    <div key={day} className="text-center text-xs text-on-surface-variant font-medium py-1">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Day buttons */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => {
                    if (day === null) {
                      return <div key={`empty-${index}`} className="aspect-square" />;
                    }

                    const dayDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                    const dayDateStr = dayDate.toISOString().split('T')[0];
                    const isSelected = dayDateStr === selectedDate;
                    const isFuture = dayDateStr > today;
                    const isSunday = dayDate.getDay() === 0;

                    return (
                      <button
                        key={day}
                        onClick={() => !isFuture && selectDate(day)}
                        disabled={isFuture}
                        className={`
                          aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all
                          ${isSelected
                            ? 'bg-primary text-on-primary'
                            : isFuture
                              ? 'text-outline cursor-not-allowed'
                              : isSunday
                                ? 'text-error/70 hover:bg-error/10'
                                : 'text-on-surface hover:bg-surface-container-high'
                          }
                        `}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                {!isToday && (
                  <button
                    onClick={goToToday}
                    className="flex-1 py-3 bg-secondary-container text-on-secondary-container rounded-xl font-semibold text-center hover:bg-secondary-container/80 transition-colors"
                  >
                    Hari Ini
                  </button>
                )}
                <button
                  onClick={() => setShowCalendar(false)}
                  className="flex-1 py-3 bg-surface-container text-on-surface rounded-xl font-semibold text-center hover:bg-surface-container-high transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Daily Summary */}
        <div className="card p-6 mb-6">
          <div className="text-center mb-4">
            <p className="text-label text-on-surface-variant mb-1">Total {formatDateDisplay(selectedDate)}</p>
            <p className="text-display text-primary">{totalAmount} <span className="text-headline text-on-surface-variant">{recordType === 'susu' ? 'ml' : 'ml/gr'}</span></p>
          </div>

          <div className="relative h-3 bg-surface-container rounded-full overflow-hidden mb-3">
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
                background: progressPercent >= 100
                  ? 'linear-gradient(to right, #4caf50, #8bc34a)'
                  : recordType === 'susu'
                    ? 'linear-gradient(to right, #2e6385, #a5d8ff)'
                    : 'linear-gradient(to right, #6d4c41, #ffab91)'
              }}
            />
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-outline">0 {recordType === 'susu' ? 'ml' : ''}</span>
            <span className={`font-semibold ${progressPercent >= 100 ? 'text-green-600' : 'text-primary'}`}>
              {progressPercent.toFixed(0)}% dari target
            </span>
            <span className="text-outline">{currentTarget} {recordType === 'susu' ? 'ml' : 'ml/gr'}</span>
          </div>

          {recordType === 'mpasi' && additionalFoods.length > 0 && (
            <div className="mt-4 pt-3 border-t border-outline-variant">
              <div className="flex gap-2 items-center justify-center flex-wrap mt-2">
                {additionalFoods.map((food) => (
                  <div 
                    key={food.id} 
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-sm transition-all hover:shadow-md ${
                      food.food_type === 'snack' 
                        ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200' 
                        : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200'
                    }`}
                  >
                    <span className="text-lg">
                      {food.food_type === 'snack' ? '🍪' : '🍎'}
                    </span>
                    <span className="text-label font-semibold">{food.food_type === 'snack' ? 'Snack' : 'Buah'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Records List */}
        {currentRecords.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4">
              <span className={`material-symbols-outlined text-on-surface-variant text-4xl`}>
                {recordType === 'susu' ? 'local_drink' : 'restaurant'}
              </span>
            </div>
            <p className="text-body text-on-surface-variant">Belum ada data</p>
            <p className="text-label text-outline mt-1">
              {isToday ? `Mulai catat ${recordType === 'susu' ? 'minum susu' : 'MPASI'} Qila` : 'Tidak ada data untuk tanggal ini'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Chart Bar */}
            <div className="card p-4 mb-4">
              <p className="text-label text-on-surface-variant mb-3">Grafik {recordType === 'susu' ? 'Minum Susu' : 'MPASI'} {formatDateDisplay(selectedDate)}</p>
              <div className="space-y-2">
                {currentRecords.map(item => {
                  const widthPercent = (item.amount / maxAmount) * 100;
                  const itemUnit = recordType === 'susu' ? 'ml' : (item as MpasiRecord).unit;
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-14 text-xs text-on-surface-variant text-right">
                        {item.time}
                      </div>
                      <div className="flex-1 h-6 bg-surface-container rounded-lg relative overflow-hidden">
                        <div
                          className="h-full rounded-lg transition-all duration-300"
                          style={{
                            width: `${Math.max(widthPercent, 5)}%`,
                            background: recordType === 'susu'
                              ? 'linear-gradient(to right, #2e6385, #a5d8ff)'
                              : 'linear-gradient(to right, #6d4c41, #ffab91)'
                          }}
                        />
                      </div>
                      <div className="w-16 text-sm font-semibold text-on-surface text-right">
                        {item.amount} {itemUnit}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Record Cards */}
            <p className="text-label text-on-surface-variant mb-2">Detail {recordType === 'susu' ? 'Minum Susu' : 'MPASI'}</p>
            {currentRecords.map(item => {
              const itemUnit = recordType === 'susu' ? 'ml' : (item as MpasiRecord).unit;
              return (
                <div
                  key={item.id}
                  className="card p-4 flex items-center justify-between hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full ${recordType === 'susu' ? 'bg-primary/10' : 'bg-secondary/10'} flex items-center justify-center ${recordType === 'susu' ? 'text-primary' : 'text-secondary'} flex-shrink-0`}>
                      <span className="material-symbols-outlined text-xl">{recordType === 'susu' ? 'local_drink' : 'restaurant'}</span>
                    </div>
                    <div>
                      <p className="text-body font-semibold text-on-surface">{item.amount} {itemUnit}</p>
                      <p className="text-label text-on-surface-variant">{item.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(item)}
                      className={`p-2 hover:bg-primary/10 rounded-full transition-all ${recordType === 'susu' ? 'text-primary' : 'text-secondary'}`}
                    >
                      <span className="material-symbols-outlined text-xl">edit</span>
                    </button>
                    <button
                      onClick={() => setDeleteId(item.id)}
                      className="text-error p-2 hover:bg-error/10 rounded-full transition-all"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
        <Link href="/history" className="nav-item active">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
          <span className="label">History</span>
        </Link>
        <Link href="/insights" className="nav-item">
          <span className="material-symbols-outlined">insights</span>
          <span className="label">Insights</span>
        </Link>
      </nav>

      {/* Edit Modal */}
      {editId !== null && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="text-headline text-on-surface mb-4">Edit Jumlah</h3>
            <input
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container rounded-xl text-on-surface text-center text-lg font-semibold mb-4"
              placeholder={`Jumlah (${recordType === 'susu' ? 'ml' : 'ml/gr'})`}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditId(null);
                  setEditAmount('');
                }}
                className="flex-1 py-3 bg-surface-container text-on-surface rounded-full font-semibold transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-3 bg-primary text-on-primary rounded-full font-semibold transition-all"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

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
          <span className="text-body">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
