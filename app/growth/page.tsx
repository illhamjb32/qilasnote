'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GrowthRecord } from '@/lib/types';
import { getGrowthRecords, addGrowthRecord, deleteGrowthRecord } from '@/lib/db';
import { createClient } from '@/lib/supabase-client';

export const dynamic = 'force-dynamic';

export default function Growth() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<GrowthRecord | null>(null);
  const [editWeight, setEditWeight] = useState('');
  const [editHeight, setEditHeight] = useState('');
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    const initUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        router.push('/login');
      }
    };
    initUser();
  }, [router]);

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  const loadData = async () => {
    if (!userId) return;
    try {
      const data = await getGrowthRecords(userId);
      setRecords(data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    try {
      const now = new Date();
      const newRecord = {
        weight: parseFloat(weight),
        height: parseFloat(height),
        date,
        notes: notes || undefined,
        timestamp: now.toISOString()
      };
      await addGrowthRecord(newRecord, userId);
      setWeight('');
      setHeight('');
      setNotes('');
      setDate(new Date().toISOString().split('T')[0]);
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

  const handleDelete = async () => {
    if (deleteId !== null && userId) {
      try {
        await deleteGrowthRecord(deleteId, userId);
        setDeleteId(null);
        await loadData();
      } catch (error) {
        console.error('Error deleting record:', error);
        alert('Gagal menghapus data.');
      }
    }
  };

  const openEditModal = (record: GrowthRecord) => {
    setSelectedRecord(record);
    setEditWeight(record.weight.toString());
    setEditHeight(record.height.toString());
    setEditNotes(record.notes || '');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Calculate growth stats
  const getLatestRecord = () => {
    if (records.length === 0) return null;
    return records[0];
  };

  const getPreviousRecord = () => {
    if (records.length < 2) return null;
    return records[1];
  };

  const latest = getLatestRecord();
  const previous = getPreviousRecord();

  const weightDiff = latest && previous ? (latest.weight - previous.weight).toFixed(2) : null;
  const heightDiff = latest && previous ? (latest.height - previous.height).toFixed(1) : null;

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-tertiary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-tertiary text-xl">straighten</span>
          </div>
          <h1 className="text-headline-sm text-primary font-quicksand">Growth</h1>
        </div>
        <Link href="/settings" className="no-underline">
          <button className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">settings</span>
          </button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="app-content">
        {/* Latest Stats */}
        {latest && (
          <div className="card p-6 mb-6 bg-gradient-to-br from-tertiary-container/50 to-tertiary-container/20">
            <h2 className="text-label text-on-surface-variant mb-4">Pengukuran Terakhir</h2>
            <div className="flex gap-6">
              <div className="flex-1 text-center">
                <span className="material-symbols-outlined text-tertiary text-3xl mb-2">fitness_center</span>
                <p className="text-display text-tertiary">{latest.weight}</p>
                <p className="text-label text-on-surface-variant">kg</p>
                {weightDiff && (
                  <p className={`text-xs mt-1 ${parseFloat(weightDiff) >= 0 ? 'text-green-600' : 'text-error'}`}>
                    {parseFloat(weightDiff) >= 0 ? '+' : ''}{weightDiff} kg
                  </p>
                )}
              </div>
              <div className="flex-1 text-center">
                <span className="material-symbols-outlined text-tertiary text-3xl mb-2">height</span>
                <p className="text-display text-tertiary">{latest.height}</p>
                <p className="text-label text-on-surface-variant">cm</p>
                {heightDiff && (
                  <p className={`text-xs mt-1 ${parseFloat(heightDiff) >= 0 ? 'text-green-600' : 'text-error'}`}>
                    {parseFloat(heightDiff) >= 0 ? '+' : ''}{heightDiff} cm
                  </p>
                )}
              </div>
            </div>
            <p className="text-xs text-on-surface-variant text-center mt-4">
              {formatDate(latest.date)}
            </p>
          </div>
        )}

        {/* Input Form */}
        <div className="card p-6 mb-6">
          <h2 className="text-headline-sm text-on-surface mb-4 px-1">Tambah Data</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-label text-on-surface-variant mb-2 block">Berat (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="input"
                  placeholder="0.00"
                  required min="0.1"
                />
              </div>
              <div>
                <label className="text-label text-on-surface-variant mb-2 block">Tinggi (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="input"
                  placeholder="0.0"
                  required min="1"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-label text-on-surface-variant mb-2 block">Tanggal</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input"
                required
              />
            </div>
            <div className="mb-4">
              <label className="text-label text-on-surface-variant mb-2 block">Catatan (opsional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input min-h-[80px] resize-none"
                placeholder="Contoh: Qila mulai bisa tengkurap"
              />
            </div>
            <button type="submit" className="btn btn-primary w-full py-4 text-lg" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </form>
        </div>

        {/* History */}
        <div className="mb-6">
          <h2 className="text-headline-sm text-on-surface mb-4 px-1">Riwayat Pertumbuhan</h2>

          <div className="space-y-3">
            {records.length === 0 ? (
              <div className="card p-4 text-center">
                <span className="material-symbols-outlined text-on-surface-variant text-4xl mb-2">straighten</span>
                <p className="text-body text-on-surface-variant">Belum ada data pertumbuhan</p>
                <p className="text-label text-outline mt-1">Mulai catat pertumbuhan Qila</p>
              </div>
            ) : (
              records.map((record, index) => (
                <div key={record.id} className="card p-4 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-tertiary">calendar_today</span>
                      </div>
                      <div>
                        <p className="text-body text-on-surface font-semibold">{formatDate(record.date)}</p>
                        <p className="text-xs text-outline">#{records.length - index}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(record)}
                        className="p-2 hover:bg-tertiary-container/50 rounded-full transition-all"
                      >
                        <span className="material-symbols-outlined text-tertiary text-xl">edit</span>
                      </button>
                      <button
                        onClick={() => record.id && setDeleteId(record.id)}
                        className="p-2 hover:bg-error/10 rounded-full transition-all"
                      >
                        <span className="material-symbols-outlined text-error text-xl">delete</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface-container rounded-xl p-3 text-center">
                      <span className="material-symbols-outlined text-on-surface-variant text-lg">fitness_center</span>
                      <p className="text-headline-sm text-tertiary mt-1">{record.weight} kg</p>
                    </div>
                    <div className="bg-surface-container rounded-xl p-3 text-center">
                      <span className="material-symbols-outlined text-on-surface-variant text-lg">height</span>
                      <p className="text-headline-sm text-tertiary mt-1">{record.height} cm</p>
                    </div>
                  </div>

                  {record.notes && (
                    <div className="mt-3 p-3 bg-tertiary-container/20 rounded-xl">
                      <p className="text-label text-on-surface-variant">{record.notes}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <Link href="/" className="nav-item">
          <span className="material-symbols-outlined">home</span>
          <span className="label">Home</span>
        </Link>
        <Link href="/growth" className="nav-item active">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>straighten</span>
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
          <span className="text-body">Data berhasil disimpan!</span>
        </div>
      )}
    </div>
  );
}
