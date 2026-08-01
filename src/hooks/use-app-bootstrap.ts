import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';

import { useAppStore } from '../store/app-store';

export const useAppBootstrap = () => {
  const isReady = useAppStore((state) => state.isReady);
  const bootstrap = useAppStore((state) => state.bootstrap);
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
  });

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return {
    isReady: isReady && fontsLoaded,
  };
};
