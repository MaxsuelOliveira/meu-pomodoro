import { useMemo } from 'react';

import { fromBooleanNumber } from '../shared/utils/format';
import { useAppStore } from '../store/app-store';

export const useDashboard = () => {
  const currentUser = useAppStore((state) => state.currentUser);
  const dashboard = useAppStore((state) => state.dashboard);
  const presets = useAppStore((state) => state.presets);
  const activeSession = useAppStore((state) => state.activeSession);
  const settings = useAppStore((state) => state.settings);
  const startSession = useAppStore((state) => state.startSession);

  const recommendedPreset = useMemo(() => presets[0] ?? null, [presets]);

  return {
    currentUser,
    dashboard,
    presets,
    activeSession,
    settings,
    startSession,
    recommendedPreset,
    hasStrictPreset: presets.some((preset) => fromBooleanNumber(preset.strictMode)),
  };
};
