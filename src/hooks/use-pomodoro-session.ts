import { useEffect, useMemo, useState } from 'react';

import { getCurrentPhaseSnapshot, getSessionTotalDuration } from '../shared/utils/session-timeline';
import { useAppStore } from '../store/app-store';

export const usePomodoroSession = () => {
  const activeSession = useAppStore((state) => state.activeSession);
  const finishSession = useAppStore((state) => state.finishSession);
  const settings = useAppStore((state) => state.settings);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!activeSession) {
      return;
    }

    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession]);

  const computed = useMemo(() => {
    if (!activeSession) {
      return null;
    }

    const elapsedSeconds = Math.max(
      0,
      Math.floor((now - new Date(activeSession.startedAt).getTime()) / 1000)
    );
    const totalDuration = getSessionTotalDuration(activeSession);
    const phase = getCurrentPhaseSnapshot(activeSession, elapsedSeconds);

    return {
      elapsedSeconds,
      totalDuration,
      phase,
      isCompleted: elapsedSeconds >= totalDuration,
    };
  }, [activeSession, now]);

  return {
    activeSession,
    settings,
    phase: computed?.phase ?? null,
    elapsedSeconds: computed?.elapsedSeconds ?? 0,
    isCompleted: computed?.isCompleted ?? false,
    totalDuration: computed?.totalDuration ?? 0,
    finishSession,
  };
};
