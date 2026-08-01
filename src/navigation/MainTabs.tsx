import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DashboardScreen } from '../screens/main/DashboardScreen';
import { HistoryScreen } from '../screens/main/HistoryScreen';
import { PresetsScreen } from '../screens/main/PresetsScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { useAppStore } from '../store/app-store';
import { theme } from '../shared/theme/theme';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const tabIcons: Record<
  keyof MainTabParamList,
  {
    active: keyof typeof Ionicons.glyphMap;
    idle: keyof typeof Ionicons.glyphMap;
    tint: string;
  }
> = {
  Hoje: { active: 'flash', idle: 'flash-outline', tint: '#C6FF63' },
  Timers: { active: 'timer', idle: 'timer-outline', tint: '#7DF9FF' },
  Historico: { active: 'bar-chart', idle: 'bar-chart-outline', tint: '#FFB86A' },
  Perfil: { active: 'sparkles', idle: 'sparkles-outline', tint: '#F4F4F5' },
};

const TabIcon = ({
  color,
  focused,
  routeName,
  size,
}: {
  color: string;
  focused: boolean;
  routeName: keyof MainTabParamList;
  size: number;
}) => {
  const config = tabIcons[routeName];
  const focusAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(focusAnim, {
      toValue: focused ? 1 : 0,
      friction: 7,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }, [focusAnim, focused]);

  const shellScale = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const glowOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.22],
  });

  const lift = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });

  return (
    <Animated.View
      style={[
        styles.iconWrap,
        {
          transform: [{ scale: shellScale }, { translateY: lift }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.iconGlow,
          {
            backgroundColor: config.tint,
            opacity: glowOpacity,
          },
        ]}
      />
      <View
        style={[
          styles.iconShell,
          focused ? { backgroundColor: config.tint, borderColor: config.tint } : styles.iconShellIdle,
        ]}
      >
        <Ionicons
          color={focused ? theme.colors.background : color}
          name={focused ? config.active : config.idle}
          size={size ?? 22}
        />
      </View>
      <View style={[styles.activeDash, focused ? { backgroundColor: config.tint, opacity: 1 } : null]} />
    </Animated.View>
  );
};

export const MainTabs = () => {
  const insets = useSafeAreaInsets();
  const activeSession = useAppStore((state) => state.activeSession);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: theme.colors.text,
        tabBarInactiveTintColor: theme.colors.textSoft,
        tabBarLabelStyle: {
          ...theme.typography.small,
          marginBottom: 2,
        },
        tabBarHideOnKeyboard: true,
        tabBarItemStyle: {
          paddingTop: 4,
          paddingBottom: 4,
        },
        tabBarIcon: ({ color, focused, size }) => {
          return <TabIcon color={color} focused={focused} routeName={route.name} size={size ?? 22} />;
        },
        tabBarStyle: {
          backgroundColor: '#080808',
          borderTopColor: '#111111',
          borderTopWidth: 1,
          display: activeSession ? 'none' : 'flex',
          height: 70 + Math.max(insets.bottom, 10),
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 10),
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.32,
          shadowRadius: 20,
          elevation: 18,
        },
      })}
    >
      <Tab.Screen component={DashboardScreen} name="Hoje" />
      <Tab.Screen component={PresetsScreen} name="Timers" />
      <Tab.Screen component={HistoryScreen} name="Historico" />
      <Tab.Screen component={ProfileScreen} name="Perfil" />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    transform: [{ translateY: -2 }],
  },
  iconGlow: {
    borderRadius: 22,
    height: 36,
    position: 'absolute',
    width: 56,
  },
  iconShell: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 58,
  },
  iconShellIdle: {
    backgroundColor: '#111111',
    borderColor: '#202020',
  },
  activeDash: {
    borderRadius: theme.radius.pill,
    height: 4,
    marginTop: 5,
    opacity: 0,
    width: 22,
  },
});
