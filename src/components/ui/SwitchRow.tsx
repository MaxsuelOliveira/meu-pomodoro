import { StyleSheet, Switch, Text, View } from 'react-native';

import { theme } from '../../shared/theme/theme';

interface SwitchRowProps {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (nextValue: boolean) => void;
}

export const SwitchRow = ({ title, description, value, onValueChange }: SwitchRowProps) => {
  return (
    <View style={styles.row}>
      <View style={styles.texts}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Switch
        onValueChange={onValueChange}
        thumbColor={value ? theme.colors.accent : '#8C8C8C'}
        trackColor={{ false: '#2E2E2E', true: '#5A5A5A' }}
        value={value}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  texts: {
    flex: 1,
    gap: 4,
  },
  title: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  description: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
  },
});
