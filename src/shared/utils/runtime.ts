import Constants from 'expo-constants';

// Expo Go exposes appOwnership as "expo"; development builds do not.
export const isExpoGo = Constants.appOwnership === 'expo' || Constants.expoGoConfig != null;
