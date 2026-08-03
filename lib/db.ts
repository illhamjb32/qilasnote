import { supabase } from './supabase';
import { MilkRecord, MpasiRecord, GrowthRecord, MpasiUnit, UserSettings } from './types';

export async function getMilkRecords(): Promise<MilkRecord[]> {
  const { data, error } = await supabase
    .from('milk_records')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getMilkRecordsByDateRange(startDate: string, endDate?: string): Promise<MilkRecord[]> {
  let query = supabase
    .from('milk_records')
    .select('*')
    .gte('date', startDate);
  
  if (endDate) {
    query = query.lte('date', endDate);
  }
  
  const { data, error } = await query.order('timestamp', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getMilkRecordsByDate(date: string): Promise<MilkRecord[]> {
  const { data, error } = await supabase
    .from('milk_records')
    .select('*')
    .eq('date', date)
    .order('time', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addMilkRecord(record: Omit<MilkRecord, 'id' | 'created_at'>): Promise<MilkRecord> {
  const { data, error } = await supabase
    .from('milk_records')
    .insert([record])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMilkRecord(id: number): Promise<void> {
  const { error } = await supabase
    .from('milk_records')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function updateMilkRecord(id: number, record: Partial<MilkRecord>): Promise<MilkRecord> {
  const { data, error } = await supabase
    .from('milk_records')
    .update(record)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAllMilkRecords(): Promise<void> {
  const { error } = await supabase
    .from('milk_records')
    .delete()
    .neq('id', 0);

  if (error) throw error;
}

export async function getUserSettings(): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateUserSettings(settings: Omit<UserSettings, 'id'>): Promise<UserSettings> {
  const existing = await getUserSettings();

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
      .insert([settings])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// Mpasi Functions
export async function getMpasiRecords(): Promise<MpasiRecord[]> {
  const { data, error } = await supabase
    .from('mpasi_records')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getMpasiRecordsByDateRange(startDate: string, endDate?: string): Promise<MpasiRecord[]> {
  let query = supabase
    .from('mpasi_records')
    .select('*')
    .gte('date', startDate);

  if (endDate) {
    query = query.lte('date', endDate);
  }

  const { data, error } = await query.order('timestamp', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getMpasiRecordsByDate(date: string): Promise<MpasiRecord[]> {
  const { data, error } = await supabase
    .from('mpasi_records')
    .select('*')
    .eq('date', date)
    .order('time', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addMpasiRecord(record: Omit<MpasiRecord, 'id' | 'created_at'>): Promise<MpasiRecord> {
  const { data, error } = await supabase
    .from('mpasi_records')
    .insert([record])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMpasiRecord(id: number): Promise<void> {
  const { error } = await supabase
    .from('mpasi_records')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function updateMpasiRecord(id: number, record: Partial<MpasiRecord>): Promise<MpasiRecord> {
  const { data, error } = await supabase
    .from('mpasi_records')
    .update(record)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAllMpasiRecords(): Promise<void> {
  const { error } = await supabase
    .from('mpasi_records')
    .delete()
    .neq('id', 0);

  if (error) throw error;
}

// Growth Records Functions
export async function getGrowthRecords(): Promise<GrowthRecord[]> {
  const { data, error } = await supabase
    .from('growth_records')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getGrowthRecordsByDateRange(startDate: string, endDate?: string): Promise<GrowthRecord[]> {
  let query = supabase
    .from('growth_records')
    .select('*')
    .gte('date', startDate);

  if (endDate) {
    query = query.lte('date', endDate);
  }

  const { data, error } = await query.order('date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getGrowthRecordsByDate(date: string): Promise<GrowthRecord[]> {
  const { data, error } = await supabase
    .from('growth_records')
    .select('*')
    .eq('date', date)
    .order('timestamp', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addGrowthRecord(record: Omit<GrowthRecord, 'id' | 'created_at'>): Promise<GrowthRecord> {
  const { data, error } = await supabase
    .from('growth_records')
    .insert([record])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteGrowthRecord(id: number): Promise<void> {
  const { error } = await supabase
    .from('growth_records')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function updateGrowthRecord(id: number, record: Partial<GrowthRecord>): Promise<GrowthRecord> {
  const { data, error } = await supabase
    .from('growth_records')
    .update(record)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAllGrowthRecords(): Promise<void> {
  const { error } = await supabase
    .from('growth_records')
    .delete()
    .neq('id', 0);

  if (error) throw error;
}
