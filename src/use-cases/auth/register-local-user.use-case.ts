import { ensureUserSeedData } from '../../db/seed';
import { userRepository } from '../../repositories/user.repository';
import type { RegisterInput, UserEntity } from '../../shared/types/entities';
import { createId } from '../../shared/utils/crypto';
import { nowIso } from '../../shared/utils/date';
import { localAuthService } from '../../services/auth/local-auth.service';
import { sessionStorageService } from '../../services/storage/session-storage.service';

export const registerLocalUserUseCase = async (input: RegisterInput) => {
  const existing = await userRepository.getByEmail(input.email);

  if (existing) {
    throw new Error('Ja existe uma conta com este email.');
  }

  const stamp = nowIso();
  const user: UserEntity = {
    id: createId(),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    passwordHash: await localAuthService.hashPassword(input.password),
    createdAt: stamp,
    updatedAt: stamp,
  };

  await userRepository.create(user);
  await ensureUserSeedData(user.id);
  await sessionStorageService.setCurrentUserId(user.id);

  return user;
};
