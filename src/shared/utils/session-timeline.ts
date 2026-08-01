import type { FocusSessionEntity, SessionPhase } from '../types/entities';

export interface SessionTimelineItem {
  cycle: number;
  durationSeconds: number;
  phase: SessionPhase;
}

export interface SessionPhaseSnapshot extends SessionTimelineItem {
  elapsedSeconds: number;
  remainingSeconds: number;
  progress: number;
  totalDurationSeconds: number;
}

export const buildSessionTimeline = (session: FocusSessionEntity): SessionTimelineItem[] => {
  const items: SessionTimelineItem[] = [];

  for (let cycle = 1; cycle <= session.rounds; cycle += 1) {
    items.push({
      cycle,
      durationSeconds: session.focusMinutes * 60,
      phase: 'focus',
    });

    if (cycle < session.rounds) {
      items.push({
        cycle,
        durationSeconds: session.shortBreakMinutes * 60,
        phase: 'shortBreak',
      });
    } else {
      items.push({
        cycle,
        durationSeconds: session.longBreakMinutes * 60,
        phase: 'longBreak',
      });
    }
  }

  return items;
};

export const getSessionTotalDuration = (session: FocusSessionEntity) => {
  return buildSessionTimeline(session).reduce((total, item) => total + item.durationSeconds, 0);
};

export const getCurrentPhaseSnapshot = (
  session: FocusSessionEntity,
  elapsedSeconds: number
): SessionPhaseSnapshot => {
  const timeline = buildSessionTimeline(session);
  const totalDurationSeconds = timeline.reduce((total, item) => total + item.durationSeconds, 0);
  let cursor = 0;

  for (const item of timeline) {
    const phaseEnd = cursor + item.durationSeconds;

    if (elapsedSeconds < phaseEnd) {
      const phaseElapsed = elapsedSeconds - cursor;
      const remainingSeconds = Math.max(0, item.durationSeconds - phaseElapsed);

      return {
        ...item,
        elapsedSeconds: Math.max(0, phaseElapsed),
        remainingSeconds,
        progress: item.durationSeconds === 0 ? 0 : Math.min(1, phaseElapsed / item.durationSeconds),
        totalDurationSeconds,
      };
    }

    cursor = phaseEnd;
  }

  const last = timeline[timeline.length - 1];

  return {
    ...last,
    elapsedSeconds: last.durationSeconds,
    remainingSeconds: 0,
    progress: 1,
    totalDurationSeconds,
  };
};
