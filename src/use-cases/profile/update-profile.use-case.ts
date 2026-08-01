import { userRepository } from '../../repositories/user.repository';
import type { UpdateProfileInput } from '../../shared/types/entities';
import { nowIso } from '../../shared/utils/date';

export const updateProfileUseCase = async (userId: string, input: UpdateProfileInput) => {
  const existing = await userRepository.getByEmail(input.email.trim().toLowerCase());

  if (existing && existing.id !== userId) {
    throw new Error('Este email ja esta em uso.');
  }

  return userRepository.updateProfile(userId, input.name, input.email.trim().toLowerCase(), nowIso());
};
