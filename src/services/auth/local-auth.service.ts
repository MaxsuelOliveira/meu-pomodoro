import { hashSecret } from '../../shared/utils/crypto';

export const localAuthService = {
  hashPassword(password: string) {
    return hashSecret(password);
  },

  async verifyPassword(password: string, passwordHash: string) {
    const candidate = await hashSecret(password);
    return candidate === passwordHash;
  },
};
