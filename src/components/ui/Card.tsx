import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { theme } from '../../shared/theme/theme';

export const Card = ({ children }: PropsWithChildren) => {
  return <View style={styles.card}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
});
