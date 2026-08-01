import { settingsRepository } from '../../repositories/settings.repository';
import type { AppSettingsEntity, UpdateSettingsInput } from '../../shared/types/entities';
import { nowIso } from '../../shared/utils/date';
import { toBooleanNumber } from '../../shared/utils/format';

export const saveSettingsUseCase = async (userId: string, input: UpdateSettingsInput) => {
  const settings: AppSettingsEntity = {
    userId,
    dailyGoalMinutes: input.dailyGoalMinutes,
    keepScreenAwake: toBooleanNumber(input.keepScreenAwake),
    notificationsEnabled: toBooleanNumber(input.notificationsEnabled),
    hapticsEnabled: toBooleanNumber(input.hapticsEnabled),
    soundEffectsEnabled: toBooleanNumber(input.soundEffectsEnabled),
    requireBiometrics: toBooleanNumber(input.requireBiometrics),
    lockSessionOnBackground: toBooleanNumber(input.lockSessionOnBackground),
    updatedAt: nowIso(),
  };

  return settingsRepository.save(settings);
};
