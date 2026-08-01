import type { TextInputProps } from 'react-native';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { theme } from '../../shared/theme/theme';

interface TextFieldProps extends TextInputProps {
  label: string;
  hint?: string;
  error?: string;
}

export const TextField = ({ label, hint, error, style, ...props }: TextFieldProps) => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.colors.textSoft}
        style={[styles.input, style]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: theme.spacing.sm,
  },
  label: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
  },
  input: {
    ...theme.typography.body,
    backgroundColor: theme.colors.surfaceAlt,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    color: theme.colors.text,
    minHeight: 54,
    paddingHorizontal: theme.spacing.md,
  },
  hint: {
    ...theme.typography.small,
    color: theme.colors.textSoft,
  },
  error: {
    ...theme.typography.small,
    color: '#FFD6D6',
  },
});
