import { userRepository } from '../../repositories/user.repository';
import type { AuthCredentialsInput } from '../../shared/types/entities';
import { localAuthService } from '../../services/auth/local-auth.service';
import { sessionStorageService } from '../../services/storage/session-storage.service';

export const loginLocalUserUseCase = async (input: AuthCredentialsInput) => {
  const user = await userRepository.getByEmail(input.email.trim().toLowerCase());

  if (!user) {
    throw new Error('Conta nao encontrada.');
  }

  const isValidPassword = await localAuthService.verifyPassword(input.password, user.passwordHash);

  if (!isValidPassword) {
    throw new Error('Senha incorreta.');
  }

  await sessionStorageService.setCurrentUserId(user.id);

  return user;
};
