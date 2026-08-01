export type SessionStatus = 'active' | 'completed' | 'interrupted' | 'cancelled';

export type SessionPhase = 'focus' | 'shortBreak' | 'longBreak';

export interface UserEntity {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface PomodoroPresetEntity {
  id: string;
  userId: string;
  name: string;
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  rounds: number;
  strictMode: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettingsEntity {
  userId: string;
  dailyGoalMinutes: number;
  keepScreenAwake: number;
  notificationsEnabled: number;
  hapticsEnabled: number;
  soundEffectsEnabled: number;
  requireBiometrics: number;
  lockSessionOnBackground: number;
  updatedAt: string;
}

export interface FocusSessionEntity {
  id: string;
  userId: string;
  presetId: string | null;
  presetName: string;
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  rounds: number;
  strictMode: number;
  status: SessionStatus;
  interruptionReason: string | null;
  startedAt: string;
  completedAt: string | null;
  interruptedAt: string | null;
}

export interface DashboardSnapshot {
  todayFocusMinutes: number;
  completedSessions: number;
  streakDays: number;
}

export interface AuthCredentialsInput {
  email: string;
  password: string;
}

export interface RegisterInput extends AuthCredentialsInput {
  name: string;
}

export interface SavePresetInput {
  id?: string;
  name: string;
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  rounds: number;
  strictMode: boolean;
}

export interface UpdateProfileInput {
  name: string;
  email: string;
}

export interface UpdateSettingsInput {
  dailyGoalMinutes: number;
  keepScreenAwake: boolean;
  notificationsEnabled: boolean;
  hapticsEnabled: boolean;
  soundEffectsEnabled: boolean;
  requireBiometrics: boolean;
  lockSessionOnBackground: boolean;
}
