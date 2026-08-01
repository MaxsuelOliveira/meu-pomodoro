import type { PropsWithChildren, ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '../../shared/theme/theme';

interface ScreenProps extends PropsWithChildren {
  footer?: ReactNode;
  scrollable?: boolean;
  safeAreaEdges?: Array<'top' | 'right' | 'bottom' | 'left'>;
}

export const Screen = ({
  children,
  footer,
  scrollable = true,
  safeAreaEdges = ['top', 'left', 'right'],
}: ScreenProps) => {
  const insets = useSafeAreaInsets();
  const content = scrollable ? (
    <ScrollView
      bounces={false}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.content}>{children}</View>
  );

  return (
    <SafeAreaView edges={safeAreaEdges} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        {content}
        {footer ? <View style={[styles.footer, { paddingBottom: theme.spacing.lg + insets.bottom }]}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    paddingTop: theme.spacing.md,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    backgroundColor: theme.colors.backgroundElevated,
  },
});
