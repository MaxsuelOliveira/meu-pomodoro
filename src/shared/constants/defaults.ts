import type { SavePresetInput, UpdateSettingsInput } from '../types/entities';

export const APP_DB_NAME = 'pomodoro-minimal.db';

export const SESSION_STORAGE_KEY = 'minimal-pomodoro.session.user-id';

export const DEFAULT_PRESETS: SavePresetInput[] = [
  {
    name: 'Deep Work',
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    rounds: 4,
    strictMode: true,
  },
  {
    name: 'Sprint',
    focusMinutes: 50,
    shortBreakMinutes: 10,
    longBreakMinutes: 20,
    rounds: 3,
    strictMode: true,
  },
  {
    name: 'Light',
    focusMinutes: 15,
    shortBreakMinutes: 3,
    longBreakMinutes: 10,
    rounds: 4,
    strictMode: false,
  },
];

export const DEFAULT_SETTINGS: UpdateSettingsInput = {
  dailyGoalMinutes: 120,
  keepScreenAwake: true,
  notificationsEnabled: true,
  hapticsEnabled: false,
  soundEffectsEnabled: true,
  requireBiometrics: false,
  lockSessionOnBackground: true,
};
