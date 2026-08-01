import { presetRepository } from '../../repositories/preset.repository';
import type { PomodoroPresetEntity, SavePresetInput } from '../../shared/types/entities';
import { createId } from '../../shared/utils/crypto';
import { nowIso } from '../../shared/utils/date';
import { toBooleanNumber } from '../../shared/utils/format';

export const savePresetUseCase = async (userId: string, input: SavePresetInput) => {
  const stamp = nowIso();
  const preset: PomodoroPresetEntity = {
    id: input.id ?? createId(),
    userId,
    name: input.name.trim(),
    focusMinutes: input.focusMinutes,
    shortBreakMinutes: input.shortBreakMinutes,
    longBreakMinutes: input.longBreakMinutes,
    rounds: input.rounds,
    strictMode: toBooleanNumber(input.strictMode),
    createdAt: stamp,
    updatedAt: stamp,
  };

  if (input.id) {
    const existing = await presetRepository.getById(input.id);

    if (existing) {
      preset.createdAt = existing.createdAt;
    }
  }

  return presetRepository.save(preset);
};
