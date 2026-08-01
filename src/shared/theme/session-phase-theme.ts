import type { SessionPhase } from '../types/entities';

export interface SessionPhasePalette {
  accent: string;
  accentGlow: string;
  accentSoft: string;
  circleBackground: string;
}

export const sessionPhasePalette: Record<SessionPhase, SessionPhasePalette> = {
  focus: {
    accent: '#C6FF63',
    accentGlow: 'rgba(198, 255, 99, 0.3)',
    accentSoft: 'rgba(198, 255, 99, 0.18)',
    circleBackground: '#0E1208',
  },
  shortBreak: {
    accent: '#7DF9FF',
    accentGlow: 'rgba(125, 249, 255, 0.3)',
    accentSoft: 'rgba(125, 249, 255, 0.18)',
    circleBackground: '#081214',
  },
  longBreak: {
    accent: '#FFB86A',
    accentGlow: 'rgba(255, 184, 106, 0.28)',
    accentSoft: 'rgba(255, 184, 106, 0.18)',
    circleBackground: '#161008',
  },
};
