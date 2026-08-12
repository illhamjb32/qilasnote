'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MilkRecord, MpasiRecord, RecordType, MpasiUnit, AdditionalFood } from '@/lib/types';
import { getMilkRecordsByDate, addMilkRecord, getMpasiRecordsByDate, addMpasiRecord, getUserSettings, upsertAdditionalFood, getAdditionalFoodByDate, deleteAdditionalFood } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default function Home() {
  const [recordType, setRecordType] = useState<RecordType>('susu');
  const [totalToday, setTotalToday] = useState(0);
  const [amount, setAmount] = useState('');
  const [mpasiUnit, setMpasiUnit] = useState<MpasiUnit>('ml');
  const [time, setTime] = useState('');
  const [historyToday, setHistoryToday] = useState<MilkRecord[]>([]);
  const [historyMpasiToday, setHistoryMpasiToday] = useState<MpasiRecord[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [dailyTarget, setDailyTarget] = useState(1000);
  const [dailyTargetMpasi, setDailyTargetMpasi] = useState(500);
  const [loading, setLoading] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [quickValues, setQuickValues] = useState([60, 90, 120, 150]);
  const [quickValuesMpasi, setQuickValuesMpasi] = useState([50, 100, 150, 200]);
  const [isSnack, setIsSnack] = useState(false);
  const [isFruit, setIsFruit] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [qilaAge, setQilaAge] = useState('');

  const percentage = Math.min((totalToday / (recordType === 'susu' ? dailyTarget : dailyTargetMpasi)) * 100, 100);

  const calculateAge = () => {
    const birthDate = new Date('2026-01-28T01:50:00');
    const now = new Date();
    
    let years = now.getFullYear() - birthDate.getFullYear();
    let months = now.getMonth() - birthDate.getMonth();
    let days = now.getDate() - birthDate.getDate();
    let hours = now.getHours() - birthDate.getHours();
    let minutes = now.getMinutes() - birthDate.getMinutes();
    let seconds = now.getSeconds() - birthDate.getSeconds();

    if (seconds < 0) {
      minutes--;
      seconds += 60;
    }
    if (minutes < 0) {
      hours--;
      minutes += 60;
    }
    if (hours < 0) {
      days--;
      hours += 24;
    }
    if (days < 0) {
      months--;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    return `${years} tahun, ${months} bulan, ${days} hari, ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };
  const circumference = 2 * Math.PI * 88;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    loadSettings();
    const now = new Date();
    setTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    loadData();
  }, [recordType]);

  useEffect(() => {
    setQilaAge(calculateAge());
    const interval = setInterval(() => {
      setQilaAge(calculateAge());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getUserSettings();
      if (settings) {
        setDailyTarget(settings.daily_target);
        setDailyTargetMpasi(settings.daily_target_mpasi || 500);
        localStorage.setItem('dailyTarget', settings.daily_target.toString());
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

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
      if (recordType === 'susu') {
        const data = await getMilkRecordsByDate(today);
        const total = data.reduce((sum, item) => sum + item.amount, 0);
        setTotalToday(total);
        setHistoryToday(data.slice(0, 5));
        setHistoryMpasiToday([]);
      } else {
        const data = await getMpasiRecordsByDate(today);
        const total = data.reduce((sum, item) => sum + item.amount, 0);
        setTotalToday(total);
        setHistoryMpasiToday(data.slice(0, 5));
        setHistoryToday([]);
        
        const additionalFoods = await getAdditionalFoodByDate(today);
        setIsSnack(additionalFoods.some(f => f.food_type === 'snack'));
        setIsFruit(additionalFoods.some(f => f.food_type === 'fruit'));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const now = new Date();
      if (recordType === 'susu') {
        const newRecord = {
          amount: parseInt(amount),
          time,
          date: getTodayString(),
          timestamp: now.toISOString()
        };
        await addMilkRecord(newRecord);
      } else {
        const newRecord = {
          amount: parseInt(amount),
          unit: mpasiUnit,
          time,
          date: getTodayString(),
          timestamp: now.toISOString()
        };
        await addMpasiRecord(newRecord);
      }
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

  const handleSnackChange = async (checked: boolean) => {
    setIsSnack(checked);
    try {
      if (checked) {
        await upsertAdditionalFood('snack', getTodayString());
      } else {
        await deleteAdditionalFood('snack', getTodayString());
      }
    } catch (error) {
      console.error('Error saving snack:', error);
    }
  };

  const handleFruitChange = async (checked: boolean) => {
    setIsFruit(checked);
    try {
      if (checked) {
        await upsertAdditionalFood('fruit', getTodayString());
      } else {
        await deleteAdditionalFood('fruit', getTodayString());
      }
    } catch (error) {
      console.error('Error saving fruit:', error);
    }
  };

  const quickInput = (value: number) => setAmount(value.toString());
  const quickInputMpasi = (value: number) => setAmount(value.toString());

  const currentQuickValues = recordType === 'susu' ? quickValues : quickValuesMpasi;

  return (
    <div className={`app-container ${recordType === 'mpasi' ? 'bg-gradient-to-b from-orange-50 to-white' : ''}`}>
      {/* Header */}
      <header className="app-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary">child_care</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-headline-sm text-primary font-quicksand leading-tight">Qila&apos;s Note</h1>
            <p className="text-xs text-on-surface-variant leading-tight">Umur: {qilaAge}</p>
          </div>
        </div>
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
              <span className="material-symbols-outlined">{recordType === 'susu' ? 'local_drink' : 'local_drink'}</span>
              <span className="text-label font-medium">Susu</span>
            </button>
            <button
              type="button"
              onClick={() => setRecordType('mpasi')}
              className={`flex-1 py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-all ${
                recordType === 'mpasi'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined">restaurant</span>
              <span className="text-label font-medium">MPASI</span>
            </button>
          </div>
        </div>

        {/* Progress Card */}
        <div className="card p-8 relative overflow-hidden mb-6">
          <div className="absolute top-0 right-0 p-4">
            <span className={`material-symbols-outlined ${recordType === 'susu' ? 'text-primary-container' : 'text-secondary-container'} opacity-30 text-6xl`}>
              {recordType === 'susu' ? 'local_drink' : 'restaurant'}
            </span>
          </div>

          <div className="relative w-48 h-48 mx-auto flex items-center justify-center mb-6">
            <svg className="w-full h-full">
              <circle cx="96" cy="96" r="88" fill="transparent" stroke={recordType === 'mpasi' ? 'rgba(251, 146, 60, 0.2)' : 'rgba(165, 216, 255, 0.2)'} strokeWidth="12" />
              <circle
                className="progress-ring"
                cx="96" cy="96" r="88" fill="transparent"
                stroke={recordType === 'mpasi' ? '#f97316' : 'var(--primary)'} strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-label text-on-surface-variant">Total Hari Ini</span>
              <span className={`text-display ${recordType === 'mpasi' ? 'text-orange-500' : 'text-primary'}`}>{totalToday}</span>
              <span className={`text-headline-sm ${recordType === 'mpasi' ? 'text-orange-500' : 'text-primary'}`}>{recordType === 'susu' ? 'ml' : mpasiUnit}</span>
              <span className="text-label text-outline mt-2">Target: {recordType === 'susu' ? dailyTarget : dailyTargetMpasi} {recordType === 'susu' ? 'ml' : mpasiUnit}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary-container rounded-full">
            <span className="material-symbols-outlined text-on-secondary-container text-lg">auto_awesome</span>
            <span className="text-label text-on-secondary-container">Bagus! {Math.round(percentage)}% tercapai</span>
          </div>

          {recordType === 'mpasi' && (isSnack || isFruit) && (
            <div className="flex items-center justify-center gap-2 px-4 py-2 mt-2 bg-tertiary-container rounded-full">
              <span className="material-symbols-outlined text-on-tertiary-container text-lg">nutrition</span>
              <span className="text-label text-on-tertiary-container">
                Hari ini: {isSnack && 'Snack'}{isSnack && isFruit && ' & '}{isFruit && 'Buah'}
              </span>
            </div>
          )}
        </div>

        {/* Quick Input */}
        <div className="mb-6">
          <h2 className="text-headline-sm text-on-surface mb-4 px-1">Input Cepat</h2>
          <div className="flex flex-wrap gap-3">
            {currentQuickValues.map((value, index) => (
              <button
                key={index}
                type="button"
                onClick={() => quickInput(value)}
                className={`flex-1 min-w-[70px] h-14 rounded-full flex flex-col items-center justify-center transition-all ${amount === value.toString() ? 'btn-chip active' : 'btn-chip'}`}
              >
                <span className={`text-headline-sm ${amount === value.toString() ? 'text-on-primary-container' : recordType === 'mpasi' ? 'text-orange-500' : 'text-primary'}`}>{value}</span>
                <span className={`text-label ${amount === value.toString() ? 'text-on-primary-container' : 'text-outline'}`}>{recordType === 'susu' ? 'ml' : mpasiUnit}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="flex-[1.5] min-w-[90px] h-14 bg-surface-container rounded-full flex items-center justify-center gap-2 transition-all hover:bg-surface-container-high">
              <span className={`material-symbols-outlined ${recordType === 'mpasi' ? 'text-orange-500' : 'text-primary'}`}>edit</span>
              <span className="text-label text-on-surface">Custom</span>
            </button>
          </div>
        </div>

        {/* Custom Quick Values Dialog */}
        {showCustomInput && (
          <div className="card p-6 mb-6">
            <h3 className="text-title-lg text-on-surface mb-4">Atur Input Cepat</h3>
            {(recordType === 'susu' ? quickValues : quickValuesMpasi).map((value, index) => (
              <div key={index} className="mb-4">
                <label className="text-label text-on-surface-variant mb-2 block">Tombol {index + 1}: {value} {recordType === 'susu' ? 'ml' : mpasiUnit}</label>
                <input
                  type="range"
                  min="10"
                  max={recordType === 'susu' ? '300' : '500'}
                  step="10"
                  value={value}
                  onChange={(e) => {
                    if (recordType === 'susu') {
                      const newValues = [...quickValues];
                      newValues[index] = parseInt(e.target.value);
                      setQuickValues(newValues);
                    } else {
                      const newValues = [...quickValuesMpasi];
                      newValues[index] = parseInt(e.target.value);
                      setQuickValuesMpasi(newValues);
                    }
                  }}
                  className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setShowCustomInput(false)}
              className="btn btn-primary w-full">
              Simpan
            </button>
          </div>
        )}

        {/* Additional Food */}
        {recordType === 'mpasi' && (
          <div className="card p-6 mb-6">
            <h3 className="text-title-md text-on-surface mb-4">Additional Food</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSnack}
                  onChange={(e) => handleSnackChange(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-outline text-primary focus:ring-2 focus:ring-primary"
                />
                <span className="text-body text-on-surface">Snack</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFruit}
                  onChange={(e) => handleFruitChange(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-outline text-primary focus:ring-2 focus:ring-primary"
                />
                <span className="text-body text-on-surface">Buah</span>
              </label>
            </div>
          </div>
        )}

        {/* Input Form */}
        <div className="card p-6 mb-6">
          <form onSubmit={handleSubmit}>
            {/* MPASI Unit Selector */}
            {recordType === 'mpasi' && (
              <div className="mb-4">
                <label className="text-label text-on-surface-variant mb-2 block">Satuan</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMpasiUnit('ml')}
                    className={`flex-1 py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-all ${
                      mpasiUnit === 'ml'
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="text-label font-medium">ml</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMpasiUnit('gr')}
                    className={`flex-1 py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-all ${
                      mpasiUnit === 'gr'
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="text-label font-medium">gr</span>
                  </button>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="text-label text-on-surface-variant mb-2 block">Jumlah ({recordType === 'susu' ? 'ml' : mpasiUnit})</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input"
                placeholder={`Masukkan jumlah ${recordType === 'susu' ? 'ml' : mpasiUnit}`}
                required min="1"
              />
              {/* Slider only for Susu */}
              {recordType === 'susu' && (
                <div className="mt-3">
                  <input
                    type="range"
                    min="10"
                    max="300"
                    step="10"
                    value={amount || 0}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-label text-on-surface-variant mt-1">
                    <span>10</span>
                    <span>300</span>
                  </div>
                </div>
              )}
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

            <button type="submit" className={`btn w-full py-4 text-lg ${recordType === 'mpasi' ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'btn-primary'}`} disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </form>
        </div>

        {/* History */}
        <div className="mb-6">
          <div className="flex justify-between items-end mb-4 px-1">
            <h2 className="text-headline-sm text-on-surface">Riwayat Terbaru</h2>
            <Link href="/history" className={`text-label hover:underline ${recordType === 'mpasi' ? 'text-orange-500' : 'text-primary'}`}>Lihat Semua</Link>
          </div>

          {recordType === 'mpasi' && (isSnack || isFruit) && (
            <div className="mb-3 px-1">
              <p className="text-label text-on-surface-variant">
                {getTodayString()} - Additional: {isSnack && 'Snack'}{isSnack && isFruit && ' & '}{isFruit && 'Buah'}
              </p>
            </div>
          )}

          <div className="space-y-3">
            {recordType === 'susu' ? (
              historyToday.length === 0 ? (
                <div className="card p-4 text-center">
                  <p className="text-body text-on-surface-variant">Belum ada data hari ini</p>
                </div>
              ) : (
                historyToday.map((item, index) => (
                  <div key={item.id} className={`card p-4 flex items-center border-l-4 ${index === 0 ? 'border-primary' : 'border-primary/40'}`}>
                    <div className="w-12 h-12 rounded-full bg-primary-container/30 flex items-center justify-center mr-4 flex-shrink-0">
                      <span className="material-symbols-outlined text-primary">local_drink</span>
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
              )
            ) : (
              historyMpasiToday.length === 0 ? (
                <div className="card p-4 text-center">
                  <p className="text-body text-on-surface-variant">Belum ada data MPASI hari ini</p>
                </div>
              ) : (
                historyMpasiToday.map((item, index) => (
                  <div key={item.id} className={`card p-4 flex items-center border-l-4 ${index === 0 ? 'border-orange-500' : 'border-orange-300'}`}>
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mr-4 flex-shrink-0">
                      <span className="material-symbols-outlined text-orange-500">restaurant</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-body text-on-surface flex items-center gap-2">
                        MPASI
                        {isSnack && (
                          <span className="material-symbols-outlined text-amber-600 text-base" title="Snack">cookie</span>
                        )}
                        {isFruit && (
                          <span className="material-symbols-outlined text-green-600 text-base" title="Buah">nutrition</span>
                        )}
                      </p>
                      <p className="text-label text-outline">Pukul {item.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-headline-sm text-orange-500">{item.amount} {item.unit}</p>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      </main>

      {/* FAB */}
      <button onClick={() => setShowTips(true)} className="fab">
        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'wght' 600" }}>help</span>
      </button>

      {/* Tips Modal */}
      {showTips && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTips(false)}>
          <div className="card p-6 max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-title-lg text-on-surface">Tips & Cara Input</h2>
              <button onClick={() => setShowTips(false)} className="p-2 hover:bg-surface-container rounded-full">
                <span className="material-symbols-outlined text-on-surface">close</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-title-md text-on-surface mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">local_drink</span>
                  Input Susu
                </h3>
                <p className="text-body text-on-surface-variant">Pilih tab Susu, gunakan tombol input cepat atau masukkan jumlah manual, lalu klik Simpan.</p>
              </div>

              <div>
                <h3 className="text-title-md text-on-surface mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">restaurant</span>
                  Input MPASI
                </h3>
                <p className="text-body text-on-surface-variant">Pilih tab MPASI, pilih satuan (ml/gr), masukkan jumlah dan waktu, lalu klik Simpan.</p>
              </div>

              <div>
                <h3 className="text-title-md text-on-surface mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary">nutrition</span>
                  Additional Food
                </h3>
                <p className="text-body text-on-surface-variant">Centang checkbox Snack atau Buah untuk mencatat makanan tambahan hari ini. Checkbox otomatis tersimpan.</p>
              </div>

              <div>
                <h3 className="text-title-md text-on-surface mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">edit</span>
                  Custom Input
                </h3>
                <p className="text-body text-on-surface-variant">Klik tombol Custom pada Input Cepat untuk mengatur nilai tombol sesuai kebutuhan Anda.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <Link href="/" className="nav-item active">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
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
        <Link href="/notes" className="nav-item">
          <span className="material-symbols-outlined">note</span>
          <span className="label">Notes</span>
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
