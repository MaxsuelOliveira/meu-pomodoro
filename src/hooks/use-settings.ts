import { useMemo } from 'react';

import { fromBooleanNumber } from '../shared/utils/format';
import { useAppStore } from '../store/app-store';

export const useSettings = () => {
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const settingsViewModel = useMemo(
    () =>
      settings
        ? {
            dailyGoalMinutes: settings.dailyGoalMinutes,
            keepScreenAwake: fromBooleanNumber(settings.keepScreenAwake),
            notificationsEnabled: fromBooleanNumber(settings.notificationsEnabled),
            hapticsEnabled: fromBooleanNumber(settings.hapticsEnabled),
            soundEffectsEnabled: fromBooleanNumber(settings.soundEffectsEnabled),
            requireBiometrics: fromBooleanNumber(settings.requireBiometrics),
            lockSessionOnBackground: fromBooleanNumber(settings.lockSessionOnBackground),
          }
        : null,
    [settings]
  );

  return {
    settings,
    updateSettings,
    settingsViewModel,
  };
};
