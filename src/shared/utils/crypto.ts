import * as Crypto from 'expo-crypto';

export const createId = () => Crypto.randomUUID();

export const hashSecret = async (value: string) => {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, value.trim());
};
