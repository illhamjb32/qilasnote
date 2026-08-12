import { MilkRecord, MpasiRecord, GrowthRecord, UserSettings, AdditionalFood, Note } from './types';
import { getAll, getByIndex, add, update, remove, clear, deleteByIndexMultiple } from './local-storage';

export async function getMilkRecords(): Promise<MilkRecord[]> {
  const records = await getAll<MilkRecord>('milk_records');
  return records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function getMilkRecordsByDateRange(startDate: string, endDate?: string): Promise<MilkRecord[]> {
  const records = await getAll<MilkRecord>('milk_records');
  return records
    .filter(r => {
      if (endDate) return r.date >= startDate && r.date <= endDate;
      return r.date >= startDate;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function getMilkRecordsByDate(date: string): Promise<MilkRecord[]> {
  const records = await getByIndex<MilkRecord>('milk_records', 'date', date);
  return records.sort((a, b) => b.time.localeCompare(a.time));
}

export async function addMilkRecord(record: Omit<MilkRecord, 'id' | 'created_at'>): Promise<MilkRecord> {
  return add('milk_records', record) as Promise<MilkRecord>;
}

export async function deleteMilkRecord(id: number): Promise<void> {
  return remove('milk_records', id);
}

export async function updateMilkRecord(id: number, record: Partial<MilkRecord>): Promise<MilkRecord> {
  return update('milk_records', id, record);
}

export async function deleteAllMilkRecords(): Promise<void> {
  return clear('milk_records');
}

export async function getUserSettings(): Promise<UserSettings | null> {
  const settings = await getAll<UserSettings>('user_settings');
  return settings[0] || null;
}

export async function updateUserSettings(settings: Omit<UserSettings, 'id'>): Promise<UserSettings> {
  const existing = await getUserSettings();
  if (existing && existing.id) {
    return update('user_settings', existing.id as number, settings) as Promise<UserSettings>;
  }
  return add('user_settings', settings) as Promise<UserSettings>;
}

export async function getMpasiRecords(): Promise<MpasiRecord[]> {
  const records = await getAll<MpasiRecord>('mpasi_records');
  return records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function getMpasiRecordsByDateRange(startDate: string, endDate?: string): Promise<MpasiRecord[]> {
  const records = await getAll<MpasiRecord>('mpasi_records');
  return records
    .filter(r => {
      if (endDate) return r.date >= startDate && r.date <= endDate;
      return r.date >= startDate;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function getMpasiRecordsByDate(date: string): Promise<MpasiRecord[]> {
  const records = await getByIndex<MpasiRecord>('mpasi_records', 'date', date);
  return records.sort((a, b) => b.time.localeCompare(a.time));
}

export async function addMpasiRecord(record: Omit<MpasiRecord, 'id' | 'created_at'>): Promise<MpasiRecord> {
  return add('mpasi_records', record) as Promise<MpasiRecord>;
}

export async function deleteMpasiRecord(id: number): Promise<void> {
  return remove('mpasi_records', id);
}

export async function updateMpasiRecord(id: number, record: Partial<MpasiRecord>): Promise<MpasiRecord> {
  return update('mpasi_records', id, record);
}

export async function deleteAllMpasiRecords(): Promise<void> {
  return clear('mpasi_records');
}

export async function getGrowthRecords(): Promise<GrowthRecord[]> {
  const records = await getAll<GrowthRecord>('growth_records');
  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getGrowthRecordsByDateRange(startDate: string, endDate?: string): Promise<GrowthRecord[]> {
  const records = await getAll<GrowthRecord>('growth_records');
  return records
    .filter(r => {
      if (endDate) return r.date >= startDate && r.date <= endDate;
      return r.date >= startDate;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getGrowthRecordsByDate(date: string): Promise<GrowthRecord[]> {
  const records = await getByIndex<GrowthRecord>('growth_records', 'date', date);
  return records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function addGrowthRecord(record: Omit<GrowthRecord, 'id' | 'created_at'>): Promise<GrowthRecord> {
  return add('growth_records', record) as Promise<GrowthRecord>;
}

export async function deleteGrowthRecord(id: number): Promise<void> {
  return remove('growth_records', id);
}

export async function updateGrowthRecord(id: number, record: Partial<GrowthRecord>): Promise<GrowthRecord> {
  return update('growth_records', id, record);
}

export async function deleteAllGrowthRecords(): Promise<void> {
  return clear('growth_records');
}

export async function deleteAdditionalFood(foodType: 'snack' | 'fruit', date: string): Promise<void> {
  const records = await getAll<AdditionalFood>('additional_food');
  const target = records.find(r => r.food_type === foodType && r.date === date);
  if (target && target.id) {
    return remove('additional_food', target.id as number);
  }
}

export async function upsertAdditionalFood(foodType: 'snack' | 'fruit', date: string): Promise<AdditionalFood> {
  const records = await getAll<AdditionalFood>('additional_food');
  const existing = records.find(r => r.food_type === foodType && r.date === date);
  
  if (existing && existing.id) {
    return update('additional_food', existing.id as number, { timestamp: new Date().toISOString() }) as Promise<AdditionalFood>;
  }
  return add('additional_food', { food_type: foodType, date, timestamp: new Date().toISOString() }) as Promise<AdditionalFood>;
}

export async function getAdditionalFoodByDate(date: string): Promise<AdditionalFood[]> {
  return getByIndex<AdditionalFood>('additional_food', 'date', date);
}

export async function getNotes(): Promise<Note[]> {
  const notes = await getAll<Note>('notes');
  return notes.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}

export async function addNote(note: Omit<Note, 'id' | 'created_at'>): Promise<Note> {
  return add('notes', note) as Promise<Note>;
}

export async function updateNote(id: number, note: Partial<Note>): Promise<Note> {
  return update('notes', id, note) as Promise<Note>;
}

export async function deleteNote(id: number): Promise<void> {
  return remove('notes', id);
}
