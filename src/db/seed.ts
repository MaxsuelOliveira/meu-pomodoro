import { DEFAULT_PRESETS, DEFAULT_SETTINGS } from '../shared/constants/defaults';
import { nowIso } from '../shared/utils/date';
import { createId } from '../shared/utils/crypto';
import { toBooleanNumber } from '../shared/utils/format';
import { getDatabase } from './database';

export const ensureUserSeedData = async (userId: string) => {
  const db = await getDatabase();
  const presetCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM pomodoro_presets WHERE user_id = ?;',
    userId
  );
  const settingsExists = await db.getFirstAsync<{ user_id: string }>(
    'SELECT user_id FROM app_settings WHERE user_id = ?;',
    userId
  );
  const stamp = nowIso();

  if (!settingsExists) {
    await db.runAsync(
      `
        INSERT INTO app_settings (
          user_id,
          daily_goal_minutes,
          keep_screen_awake,
          notifications_enabled,
          haptics_enabled,
          sound_effects_enabled,
          require_biometrics,
          lock_session_on_background,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
      `,
      userId,
      DEFAULT_SETTINGS.dailyGoalMinutes,
      toBooleanNumber(DEFAULT_SETTINGS.keepScreenAwake),
      toBooleanNumber(DEFAULT_SETTINGS.notificationsEnabled),
      toBooleanNumber(DEFAULT_SETTINGS.hapticsEnabled),
      toBooleanNumber(DEFAULT_SETTINGS.soundEffectsEnabled),
      toBooleanNumber(DEFAULT_SETTINGS.requireBiometrics),
      toBooleanNumber(DEFAULT_SETTINGS.lockSessionOnBackground),
      stamp
    );
  }

  if ((presetCount?.count ?? 0) === 0) {
    for (const preset of DEFAULT_PRESETS) {
      await db.runAsync(
        `
          INSERT INTO pomodoro_presets (
            id,
            user_id,
            name,
            focus_minutes,
            short_break_minutes,
            long_break_minutes,
            rounds,
            strict_mode,
            created_at,
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `,
        createId(),
        userId,
        preset.name,
        preset.focusMinutes,
        preset.shortBreakMinutes,
        preset.longBreakMinutes,
        preset.rounds,
        toBooleanNumber(preset.strictMode),
        stamp,
        stamp
      );
    }
  }
};
