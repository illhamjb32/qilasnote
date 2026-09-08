import { supabase } from './supabase';
import { MilkRecord, MpasiRecord, GrowthRecord, MpasiUnit, UserSettings, AdditionalFood, Note } from './types';

export async function getMilkRecords(userId: string): Promise<MilkRecord[]> {
  const { data, error } = await supabase
    .from('milk_records')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getMilkRecordsByDateRange(startDate: string, userId: string, endDate?: string): Promise<MilkRecord[]> {
  let query = supabase
    .from('milk_records')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate);
  
  if (endDate) {
    query = query.lte('date', endDate);
  }
  
  const { data, error } = await query.order('timestamp', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getMilkRecordsByDate(date: string, userId: string): Promise<MilkRecord[]> {
  const { data, error } = await supabase
    .from('milk_records')
    .select('*')
    .eq('date', date)
    .eq('user_id', userId)
    .order('time', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addMilkRecord(record: Omit<MilkRecord, 'id' | 'created_at'>, userId: string): Promise<MilkRecord> {
  const { data, error } = await supabase
    .from('milk_records')
    .insert([{ ...record, user_id: userId }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMilkRecord(id: number, userId: string): Promise<void> {
  const { error } = await supabase
    .from('milk_records')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function updateMilkRecord(id: number, record: Partial<MilkRecord>, userId: string): Promise<MilkRecord> {
  const { data, error } = await supabase
    .from('milk_records')
    .update(record)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAllMilkRecords(userId: string): Promise<void> {
  const { error } = await supabase
    .from('milk_records')
    .delete()
    .eq('user_id', userId)
    .neq('id', 0);

  if (error) throw error;
}

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateUserSettings(settings: Omit<UserSettings, 'id'>, userId: string): Promise<UserSettings> {
  const existing = await getUserSettings(userId);

  if (existing) {
    const { data, error } = await supabase
      .from('user_settings')
      .update(settings)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('user_settings')
      .insert([{ ...settings, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// Mpasi Functions
export async function getMpasiRecords(userId: string): Promise<MpasiRecord[]> {
  const { data, error } = await supabase
    .from('mpasi_records')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getMpasiRecordsByDateRange(startDate: string, userId: string, endDate?: string): Promise<MpasiRecord[]> {
  let query = supabase
    .from('mpasi_records')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate);

  if (endDate) {
    query = query.lte('date', endDate);
  }

  const { data, error } = await query.order('timestamp', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getMpasiRecordsByDate(date: string, userId: string): Promise<MpasiRecord[]> {
  const { data, error } = await supabase
    .from('mpasi_records')
    .select('*')
    .eq('date', date)
    .eq('user_id', userId)
    .order('time', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addMpasiRecord(record: Omit<MpasiRecord, 'id' | 'created_at'>, userId: string): Promise<MpasiRecord> {
  const { data, error } = await supabase
    .from('mpasi_records')
    .insert([{ ...record, user_id: userId }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMpasiRecord(id: number, userId: string): Promise<void> {
  const { error } = await supabase
    .from('mpasi_records')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function updateMpasiRecord(id: number, record: Partial<MpasiRecord>, userId: string): Promise<MpasiRecord> {
  const { data, error } = await supabase
    .from('mpasi_records')
    .update(record)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAllMpasiRecords(userId: string): Promise<void> {
  const { error } = await supabase
    .from('mpasi_records')
    .delete()
    .eq('user_id', userId)
    .neq('id', 0);

  if (error) throw error;
}

// Growth Records Functions
export async function getGrowthRecords(userId: string): Promise<GrowthRecord[]> {
  const { data, error } = await supabase
    .from('growth_records')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getGrowthRecordsByDateRange(startDate: string, userId: string, endDate?: string): Promise<GrowthRecord[]> {
  let query = supabase
    .from('growth_records')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate);

  if (endDate) {
    query = query.lte('date', endDate);
  }

  const { data, error } = await query.order('date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getGrowthRecordsByDate(date: string, userId: string): Promise<GrowthRecord[]> {
  const { data, error } = await supabase
    .from('growth_records')
    .select('*')
    .eq('date', date)
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addGrowthRecord(record: Omit<GrowthRecord, 'id' | 'created_at'>, userId: string): Promise<GrowthRecord> {
  const { data, error } = await supabase
    .from('growth_records')
    .insert([{ ...record, user_id: userId }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteGrowthRecord(id: number, userId: string): Promise<void> {
  const { error } = await supabase
    .from('growth_records')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function updateGrowthRecord(id: number, record: Partial<GrowthRecord>, userId: string): Promise<GrowthRecord> {
  const { data, error } = await supabase
    .from('growth_records')
    .update(record)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAllGrowthRecords(userId: string): Promise<void> {
  const { error } = await supabase
    .from('growth_records')
    .delete()
    .eq('user_id', userId)
    .neq('id', 0);

  if (error) throw error;
}

export async function deleteAdditionalFood(foodType: 'snack' | 'fruit', date: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('additional_food')
    .delete()
    .eq('food_type', foodType)
    .eq('date', date)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function upsertAdditionalFood(foodType: 'snack' | 'fruit', date: string, userId: string): Promise<AdditionalFood> {
  const { data: existing, error: checkError } = await supabase
    .from('additional_food')
    .select('*')
    .eq('food_type', foodType)
    .eq('date', date)
    .eq('user_id', userId)
    .single();

  if (checkError && checkError.code !== 'PGRST116') throw checkError;

  if (existing) {
    const { data, error } = await supabase
      .from('additional_food')
      .update({ timestamp: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('additional_food')
      .insert([{
        food_type: foodType,
        date,
        timestamp: new Date().toISOString(),
        user_id: userId
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export async function getAdditionalFoodByDate(date: string, userId: string): Promise<AdditionalFood[]> {
  const { data, error } = await supabase
    .from('additional_food')
    .select('*')
    .eq('date', date)
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
}

export async function getNotes(userId: string): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('pinned', { ascending: false })
    .order('timestamp', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addNote(note: Omit<Note, 'id' | 'created_at'>, userId: string): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .insert([{ ...note, user_id: userId }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateNote(id: number, note: Partial<Note>, userId: string): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .update(note)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteNote(id: number, userId: string): Promise<void> {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}
