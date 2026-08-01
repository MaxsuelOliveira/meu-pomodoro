import { NavigationContainer, DarkTheme, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useCallback, useEffect } from 'react';

import { useAppStore } from '../store/app-store';
import { theme } from '../shared/theme/theme';
import { AuthScreen } from '../screens/auth/AuthScreen';
import { FocusSessionScreen } from '../screens/focus/FocusSessionScreen';
import { MainTabs } from './MainTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: theme.colors.background,
    card: theme.colors.backgroundElevated,
    primary: theme.colors.text,
    border: theme.colors.border,
    text: theme.colors.text,
  },
};

export const RootNavigator = () => {
  const isAuthenticated = useAppStore((state) => state.status === 'authenticated');
  const activeSession = useAppStore((state) => state.activeSession);
  const navigationRef = useNavigationContainerRef<RootStackParamList>();

  const syncFocusRoute = useCallback(() => {
    if (!navigationRef.isReady() || !isAuthenticated) {
      return;
    }

    const currentRoute = navigationRef.getCurrentRoute()?.name;

    if (activeSession && currentRoute !== 'FocusSession') {
      navigationRef.navigate('FocusSession');
      return;
    }

    if (!activeSession && currentRoute === 'FocusSession') {
      navigationRef.resetRoot({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    }
  }, [activeSession, isAuthenticated, navigationRef]);

  useEffect(() => {
    syncFocusRoute();
  }, [syncFocusRoute]);

  return (
    <NavigationContainer onReady={syncFocusRoute} ref={navigationRef} theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? (activeSession ? 'FocusSession' : 'Main') : 'Auth'}
        screenOptions={{
          animation: 'fade',
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
          headerShown: false,
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen component={MainTabs} name="Main" />
            <Stack.Screen
              component={FocusSessionScreen}
              name="FocusSession"
              options={{
                gestureEnabled: false,
                navigationBarHidden: true,
                presentation: 'fullScreenModal',
                statusBarAnimation: 'fade',
                statusBarHidden: true,
              }}
            />
          </>
        ) : (
          <Stack.Screen component={AuthScreen} name="Auth" />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
