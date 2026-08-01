import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';

import { isExpoGo } from '../../shared/utils/runtime';

export const focusModeService = {
  async enter() {
    if (Platform.OS === 'android' && !isExpoGo) {
      await NavigationBar.setVisibilityAsync('hidden');
    }
  },

  async exit() {
    if (Platform.OS === 'android' && !isExpoGo) {
      await NavigationBar.setVisibilityAsync('visible');
    }
  },
};
