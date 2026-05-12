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
  lastChecked: string;
}

export interface VacancyLog {
  id: number;
  courseId: string;
  courseName: string;
  triggeredAt: string;
}

export type RegisterMode = 'course' | 'timeslot';

export interface RegisterParams {
  mode: RegisterMode;
  code?: string;
  division?: string;
  day?: string;
  timeFrom?: string;
  timeTo?: string;
  name: string;
  enrolled: number;
  limit: number;
}

export interface CourseResult {
  courseId: string;
  code: string;
  name: string;
  professor: string;
  day: string;
  time: string;
  room: string;
  limit: number;
  enrolled: number;
  remain: number;
}