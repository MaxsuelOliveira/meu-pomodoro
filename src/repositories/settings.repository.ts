import { getDatabase } from '../db/database';
import type { AppSettingsEntity } from '../shared/types/entities';

const mapSettings = (row: any): AppSettingsEntity => ({
  userId: row.user_id,
  dailyGoalMinutes: row.daily_goal_minutes,
  keepScreenAwake: row.keep_screen_awake,
  notificationsEnabled: row.notifications_enabled,
  hapticsEnabled: row.haptics_enabled,
  soundEffectsEnabled: row.sound_effects_enabled,
  requireBiometrics: row.require_biometrics,
  lockSessionOnBackground: row.lock_session_on_background,
  updatedAt: row.updated_at,
});

export const settingsRepository = {
  async getByUserId(userId: string) {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>('SELECT * FROM app_settings WHERE user_id = ?;', userId);

    return row ? mapSettings(row) : null;
  },

  async save(settings: AppSettingsEntity) {
    const db = await getDatabase();

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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          daily_goal_minutes = excluded.daily_goal_minutes,
          keep_screen_awake = excluded.keep_screen_awake,
          notifications_enabled = excluded.notifications_enabled,
          haptics_enabled = excluded.haptics_enabled,
          sound_effects_enabled = excluded.sound_effects_enabled,
          require_biometrics = excluded.require_biometrics,
          lock_session_on_background = excluded.lock_session_on_background,
          updated_at = excluded.updated_at;
      `,
      settings.userId,
      settings.dailyGoalMinutes,
      settings.keepScreenAwake,
      settings.notificationsEnabled,
      settings.hapticsEnabled,
      settings.soundEffectsEnabled,
      settings.requireBiometrics,
      settings.lockSessionOnBackground,
      settings.updatedAt
    );

    return this.getByUserId(settings.userId);
  },
};
