import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../shared/theme/theme';

interface StatPillProps {
  label: string;
  value: string;
}

export const StatPill = ({ label, value }: StatPillProps) => {
  return (
    <View style={styles.pill}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    backgroundColor: theme.colors.surfaceAlt,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    minHeight: 82,
    padding: theme.spacing.md,
  },
  value: {
    ...theme.typography.title,
    color: theme.colors.text,
  },
  label: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
  },
});
