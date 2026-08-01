import type { PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export const AppProviders = ({ children }: PropsWithChildren) => {
  return <SafeAreaProvider>{children}</SafeAreaProvider>;
};
