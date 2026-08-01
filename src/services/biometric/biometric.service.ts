import * as LocalAuthentication from 'expo-local-authentication';

export const biometricService = {
  async isAvailable() {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    return hasHardware && isEnrolled;
  },

  async authenticate() {
    const available = await this.isAvailable();

    if (!available) {
      return false;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Confirmar identidade',
      disableDeviceFallback: false,
      fallbackLabel: 'Usar senha do aparelho',
    });

    return result.success;
  },
};
