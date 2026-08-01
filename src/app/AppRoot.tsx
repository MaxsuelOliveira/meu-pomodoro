import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { RootNavigator } from '../navigation/RootNavigator';
import { theme } from '../shared/theme/theme';
import { useAppBootstrap } from '../hooks/use-app-bootstrap';

export const AppRoot = () => {
  const { isReady } = useAppBootstrap();

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <StatusBar style="light" />
        <ActivityIndicator color={theme.colors.text} />
        <Text style={styles.loadingText}>carregando o foco</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <RootNavigator />
    </>
  );
};

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    flex: 1,
    gap: theme.spacing.md,
    justifyContent: 'center',
  },
  loadingText: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
});
