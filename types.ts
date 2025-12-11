// Extending the Navigator interface to include getBattery
// Note: This is a non-standard web API, supported in Chrome/Edge/Android
export interface BatteryManager extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  onchargingchange: ((this: BatteryManager, ev: Event) => any) | null;
  onchargingtimechange: ((this: BatteryManager, ev: Event) => any) | null;
  ondischargingtimechange: ((this: BatteryManager, ev: Event) => any) | null;
  onlevelchange: ((this: BatteryManager, ev: Event) => any) | null;
}

// Extending the global Navigator interface
declare global {
  interface Navigator {
    getBattery?: () => Promise<BatteryManager>;
  }
}

export enum SystemStatus {
  STANDBY = 'STANDBY',
  SCANNING = 'SCANNING',
  CHARGING_NOMINAL = 'CHARGING_NOMINAL',
  POWER_FAILURE_ALERT = 'POWER_FAILURE_ALERT', // Plugged in but not charging
  BATTERY_CRITICAL = 'BATTERY_CRITICAL'
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'alert' | 'success';
}
