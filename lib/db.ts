import { supabase } from './supabase';
import { MilkRecord, UserSettings } from './types';

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

export async function updateUserSettings(settings: UserSettings): Promise<UserSettings> {
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
