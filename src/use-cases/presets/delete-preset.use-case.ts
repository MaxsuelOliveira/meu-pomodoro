import { presetRepository } from '../../repositories/preset.repository';

export const deletePresetUseCase = async (presetId: string) => {
  await presetRepository.delete(presetId);
};
