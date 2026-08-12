export type RecordType = 'susu' | 'mpasi' | 'growth';
export type MpasiUnit = 'ml' | 'gr';

export interface MilkRecord {
  id?: number;
  amount: number;
  time: string;
  date: string;
  timestamp: string;
  created_at?: string;
}

export interface MpasiRecord {
  id?: number;
  amount: number;
  unit: MpasiUnit;
  time: string;
  date: string;
  timestamp: string;
  created_at?: string;
}

export interface AdditionalFood {
  id?: number;
  food_type: 'snack' | 'fruit';
  date: string;
  timestamp: string;
  created_at?: string;
}

export interface GrowthRecord {
  id?: number;
  weight: number;
  height: number;
  date: string;
  notes?: string;
  timestamp: string;
  created_at?: string;
}

export interface UserSettings {
  id?: number;
  daily_target: number;
  daily_target_mpasi?: number;
  notifications_enabled: boolean;
  reminder_interval: number;
}

export interface Note {
  id?: number;
  title: string;
  content: string;
  pinned: boolean;
  timestamp: string;
  created_at?: string;
}
