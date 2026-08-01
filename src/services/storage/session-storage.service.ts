import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { SESSION_STORAGE_KEY } from '../../shared/constants/defaults';

const webStorage = {
  getItem(key: string) {
    if (typeof window === 'undefined') {
      return null;
    }

    return window.localStorage.getItem(key);
  },

  setItem(key: string, value: string) {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
  },

  removeItem(key: string) {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  },
};

export const sessionStorageService = {
  async getCurrentUserId() {
    if (Platform.OS === 'web') {
      return webStorage.getItem(SESSION_STORAGE_KEY);
    }

    return SecureStore.getItemAsync(SESSION_STORAGE_KEY);
  },

  async setCurrentUserId(userId: string) {
    if (Platform.OS === 'web') {
      webStorage.setItem(SESSION_STORAGE_KEY, userId);
      return;
    }

    return SecureStore.setItemAsync(SESSION_STORAGE_KEY, userId);
  },

  async clear() {
    if (Platform.OS === 'web') {
      webStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }

    return SecureStore.deleteItemAsync(SESSION_STORAGE_KEY);
  },
};
