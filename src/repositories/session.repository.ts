import { endOfTodayIso, startOfTodayIso } from '../shared/utils/date';
import { getDatabase } from '../db/database';
import type { DashboardSnapshot, FocusSessionEntity, SessionStatus } from '../shared/types/entities';

const mapSession = (row: any): FocusSessionEntity => ({
  id: row.id,
  userId: row.user_id,
  presetId: row.preset_id,
  presetName: row.preset_name,
  focusMinutes: row.focus_minutes,
  shortBreakMinutes: row.short_break_minutes,
  longBreakMinutes: row.long_break_minutes,
  rounds: row.rounds,
  strictMode: row.strict_mode,
  status: row.status,
  interruptionReason: row.interruption_reason,
  startedAt: row.started_at,
  completedAt: row.completed_at,
  interruptedAt: row.interrupted_at,
});

const calculateStreak = (days: string[]) => {
  if (!days.length) {
    return 0;
  }

  const uniqueDays = [...new Set(days)].sort().reverse();
  let streak = 0;
  let cursor = new Date();

  for (const day of uniqueDays) {
    const target = cursor.toISOString().slice(0, 10);

    if (day === target) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }

    if (streak === 0) {
      cursor.setDate(cursor.getDate() - 1);
      if (day === cursor.toISOString().slice(0, 10)) {
        streak += 1;
      }
    }

    break;
  }

  return streak;
};

export const sessionRepository = {
  async listByUserId(userId: string, limit = 30) {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      `
        SELECT * FROM focus_sessions
        WHERE user_id = ?
        ORDER BY started_at DESC
        LIMIT ?;
      `,
      userId,
      limit
    );

    return rows.map(mapSession);
  },

  async getActiveByUserId(userId: string) {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(
      `
        SELECT * FROM focus_sessions
        WHERE user_id = ? AND status = 'active'
        ORDER BY started_at DESC
        LIMIT 1;
      `,
      userId
    );

    return row ? mapSession(row) : null;
  },

  async create(session: FocusSessionEntity) {
    const db = await getDatabase();

    await db.runAsync(
      `
        INSERT INTO focus_sessions (
          id, user_id, preset_id, preset_name, focus_minutes, short_break_minutes,
          long_break_minutes, rounds, strict_mode, status, interruption_reason,
          started_at, completed_at, interrupted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `,
      session.id,
      session.userId,
      session.presetId,
      session.presetName,
      session.focusMinutes,
      session.shortBreakMinutes,
      session.longBreakMinutes,
      session.rounds,
      session.strictMode,
      session.status,
      session.interruptionReason,
      session.startedAt,
      session.completedAt,
      session.interruptedAt
    );

    return this.getActiveByUserId(session.userId);
  },

  async updateStatus(id: string, status: SessionStatus, stamp: string, reason: string | null = null) {
    const db = await getDatabase();
    const completedAt = status === 'completed' ? stamp : null;
    const interruptedAt = status === 'interrupted' || status === 'cancelled' ? stamp : null;

    await db.runAsync(
      `
        UPDATE focus_sessions
        SET status = ?, completed_at = ?, interrupted_at = ?, interruption_reason = ?
        WHERE id = ?;
      `,
      status,
      completedAt,
      interruptedAt,
      reason,
      id
    );
  },

  async getDashboard(userId: string): Promise<DashboardSnapshot> {
    const db = await getDatabase();
    const summary = await db.getFirstAsync<any>(
      `
        SELECT
          COALESCE(SUM(focus_minutes * rounds), 0) as total_focus_minutes,
          COUNT(*) as completed_sessions
        FROM focus_sessions
        WHERE user_id = ?
          AND status = 'completed'
          AND started_at BETWEEN ? AND ?;
      `,
      userId,
      startOfTodayIso(),
      endOfTodayIso()
    );
    const streakRows = await db.getAllAsync<{ day: string }>(
      `
        SELECT substr(started_at, 1, 10) as day
        FROM focus_sessions
        WHERE user_id = ? AND status = 'completed'
        GROUP BY substr(started_at, 1, 10)
        ORDER BY day DESC
        LIMIT 7;
      `,
      userId
    );

    return {
      todayFocusMinutes: summary?.total_focus_minutes ?? 0,
      completedSessions: summary?.completed_sessions ?? 0,
      streakDays: calculateStreak(streakRows.map((row) => row.day)),
    };
  },
};
