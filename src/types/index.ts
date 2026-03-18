export type AlertStatus = 'monitoring' | 'triggered' | 'idle';

export interface AlertItem {
  id: number;
  code: string;
  name: string;
  day: string;
  period: string;
  status: AlertStatus;
  current: number;
  max: number;
  checks: number;
  regTime: string;
}