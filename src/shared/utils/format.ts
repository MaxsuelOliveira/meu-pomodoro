export const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export const toBooleanNumber = (value: boolean) => (value ? 1 : 0);

export const fromBooleanNumber = (value: number) => value === 1;

export const formatClock = (totalSeconds: number) => {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const formatMinutes = (minutes: number) => `${minutes} min`;

export const formatFocusSummary = (focus: number, shortBreak: number, rounds: number) => {
  return `${focus}/${shortBreak} · ${rounds} ciclos`;
};
