export interface MilkRecord {
  id: number;
  amount: number;
  time: string;
  date: string;
  timestamp: string;
  created_at?: string;
}

export interface UserSettings {
  id?: string;
  daily_target: number;
  notifications_enabled: boolean;
  reminder_interval: number;
}
