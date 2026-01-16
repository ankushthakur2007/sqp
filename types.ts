export type SafetyStatus = 'safe' | 'recordable' | 'lost-time';

export interface DailyData {
  production: number | null;
  quality: number | null;
  safetyStatus?: SafetyStatus;
}

export type Letter = 'S' | 'O' | 'P' | 'Q';

export type DataStatus = 'good' | 'warning' | 'alert' | 'default';

export interface Thresholds {
  productionTarget: number;  // Target/goal for production (e.g., 4000 units)
  productionGood: number;    // Good if >= this % of target
  productionAlert: number;   // Alert if < this % of target
  qualityGood: number;
  qualityAlert: number;
}

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}