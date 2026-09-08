'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Note } from '@/lib/types';
import { getNotes, addNote, updateNote, deleteNote } from '@/lib/db';
import { createClient } from '@/lib/supabase-client';

export const dynamic = 'force-dynamic';

export default function Notes() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewNote, setViewNote] = useState<Note | null>(null);

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
      loadNotes();
    }
  }, [userId]);

  const loadNotes = async () => {
    if (!userId) return;
    try {
      const data = await getNotes(userId);
      setNotes(data);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Judul dan isi catatan tidak boleh kosong');
      return;
    }

    if (!userId) return;

    try {
      if (editingNote && editingNote.id) {
        await updateNote(editingNote.id, {
          title: title.trim(),
          content: content.trim(),
          timestamp: new Date().toISOString()
        }, userId);
      } else {
        await addNote({
          title: title.trim(),
          content: content.trim(),
          pinned: false,
          timestamp: new Date().toISOString()
        }, userId);
      }
      
      setTitle('');
      setContent('');
      setShowModal(false);
      setEditingNote(null);
      await loadNotes();
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (error: any) {
      console.error('Error saving note:', error);
      alert(`Gagal menyimpan catatan: ${error?.message || JSON.stringify(error)}`);
    }
  };

  const handlePin = async (note: Note) => {
    if (!note.id || !userId) return;
    try {
      await updateNote(note.id, { pinned: !note.pinned }, userId);
      await loadNotes();
    } catch (error) {
      console.error('Error pinning note:', error);
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (deleteId !== null && userId) {
      try {
        await deleteNote(deleteId, userId);
        setDeleteId(null);
        await loadNotes();
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const openNewNote = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingNote(null);
    setTitle('');
    setContent('');
  };

  return (
    <div className="container">
      <header className="header">
        <h1 className="text-headline-lg text-on-surface">Catatan</h1>
        <Link href="/settings">
          <span className="material-symbols-outlined text-on-surface-variant">settings</span>
        </Link>
      </header>

      <main className="main-content pb-32">
        {notes.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="inline-block p-6 bg-surface-container rounded-full mb-6">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '4rem' }}>note_stack</span>
            </div>
            <p className="text-title-lg text-on-surface mb-2">Belum ada catatan</p>
            <p className="text-body text-on-surface-variant">Tekan tombol + untuk membuat catatan baru</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => setViewNote(note)}
                className={`bg-surface-container-lowest rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
                  note.pinned 
                    ? 'ring-2 ring-primary bg-primary-container/10' 
                    : ''
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {note.pinned && (
                        <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                          push_pin
                        </span>
                      )}
                      <h3 className="text-lg font-semibold text-on-surface break-words">{note.title}</h3>
                    </div>
                    <p className="text-sm text-on-surface-variant whitespace-pre-wrap line-clamp-2 leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePin(note); }}
                      className={`p-2 rounded-full transition-all ${
                        note.pinned 
                          ? 'bg-primary/10 text-primary' 
                          : 'hover:bg-surface-container text-on-surface-variant'
                      }`}
                      title={note.pinned ? 'Unpin' : 'Pin'}
                    >
                      <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: note.pinned ? "'FILL' 1" : "" }}>
                        push_pin
                      </span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(note); }}
                      className="p-2 hover:bg-tertiary-container/50 text-on-surface-variant hover:text-tertiary rounded-full transition-all"
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-xl">edit</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); note.id && setDeleteId(note.id); }}
                      className="p-2 hover:bg-error-container/50 text-on-surface-variant hover:text-error rounded-full transition-all"
                      title="Delete"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant/70">
                  <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>schedule</span>
                  <span>
                    {new Date(note.timestamp).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <button
        onClick={openNewNote}
        className="fab"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

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
        <Link href="/notes" className="nav-item active">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>note</span>
          <span className="label">Notes</span>
        </Link>
        <Link href="/insights" className="nav-item">
          <span className="material-symbols-outlined">insights</span>
          <span className="label">Insights</span>
        </Link>
      </nav>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-headline-md text-on-surface">
                {editingNote ? 'Edit Catatan' : 'Catatan Baru'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-surface-container rounded-full">
                <span className="material-symbols-outlined text-on-surface">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-label text-on-surface-variant mb-1 block">Judul</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input"
                  placeholder="Masukkan judul catatan"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-label text-on-surface-variant mb-1 block">Isi Catatan</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="input min-h-48 resize-none"
                  placeholder="Tulis catatan di sini..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 py-3 bg-surface-container text-on-surface rounded-full font-semibold transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 bg-primary text-on-primary rounded-full font-semibold transition-all"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="text-headline-md text-on-surface mb-2">Hapus Catatan?</h2>
            <p className="text-body text-on-surface-variant mb-4">Catatan yang dihapus tidak dapat dikembalikan.</p>
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

      {viewNote && (
        <div className="modal-overlay" onClick={() => setViewNote(null)}>
          <div className="modal max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-2">
                  {viewNote.pinned && (
                    <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                      push_pin
                    </span>
                  )}
                  <h2 className="text-headline-md text-on-surface break-words">{viewNote.title}</h2>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant/70 mb-4">
                  <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>schedule</span>
                  <span>
                    {new Date(viewNote.timestamp).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
              <button onClick={() => setViewNote(null)} className="p-2 hover:bg-surface-container rounded-full flex-shrink-0">
                <span className="material-symbols-outlined text-on-surface">close</span>
              </button>
            </div>
            <p className="text-body text-on-surface whitespace-pre-wrap leading-relaxed mb-6">
              {viewNote.content}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { setViewNote(null); handleEdit(viewNote); }}
                className="flex-1 py-3 bg-tertiary text-on-tertiary rounded-full font-semibold transition-all"
              >
                <span className="material-symbols-outlined mr-2 text-xl align-middle">edit</span>
                Edit
              </button>
              <button
                onClick={() => { setViewNote(null); viewNote.id && setDeleteId(viewNote.id); }}
                className="flex-1 py-3 bg-error-container text-error rounded-full font-semibold transition-all"
              >
                <span className="material-symbols-outlined mr-2 text-xl align-middle">delete</span>
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="toast">
          <span className="material-symbols-outlined text-on-tertiary-container">check_circle</span>
          <span className="text-body">Catatan berhasil disimpan!</span>
        </div>
      )}
    </div>
  );
}
