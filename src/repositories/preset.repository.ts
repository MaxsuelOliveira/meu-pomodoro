import { getDatabase } from '../db/database';
import type { PomodoroPresetEntity } from '../shared/types/entities';

const mapPreset = (row: any): PomodoroPresetEntity => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  focusMinutes: row.focus_minutes,
  shortBreakMinutes: row.short_break_minutes,
  longBreakMinutes: row.long_break_minutes,
  rounds: row.rounds,
  strictMode: row.strict_mode,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const presetRepository = {
  async listByUserId(userId: string) {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM pomodoro_presets WHERE user_id = ? ORDER BY created_at DESC;',
      userId
    );

    return rows.map(mapPreset);
  },

  async getById(id: string) {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>('SELECT * FROM pomodoro_presets WHERE id = ?;', id);

    return row ? mapPreset(row) : null;
  },

  async save(preset: PomodoroPresetEntity) {
    const db = await getDatabase();
    const existing = await this.getById(preset.id);

    if (existing) {
      await db.runAsync(
        `
          UPDATE pomodoro_presets
          SET name = ?, focus_minutes = ?, short_break_minutes = ?, long_break_minutes = ?,
              rounds = ?, strict_mode = ?, updated_at = ?
          WHERE id = ?;
        `,
        preset.name,
        preset.focusMinutes,
        preset.shortBreakMinutes,
        preset.longBreakMinutes,
        preset.rounds,
        preset.strictMode,
        preset.updatedAt,
        preset.id
      );
    } else {
      await db.runAsync(
        `
          INSERT INTO pomodoro_presets (
            id, user_id, name, focus_minutes, short_break_minutes, long_break_minutes,
            rounds, strict_mode, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `,
        preset.id,
        preset.userId,
        preset.name,
        preset.focusMinutes,
        preset.shortBreakMinutes,
        preset.longBreakMinutes,
        preset.rounds,
        preset.strictMode,
        preset.createdAt,
        preset.updatedAt
      );
    }

    return this.getById(preset.id);
  },

  async delete(id: string) {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM pomodoro_presets WHERE id = ?;', id);
  },
};
