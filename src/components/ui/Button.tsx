import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { theme } from '../../shared/theme/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

export const Button = ({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variants[variant],
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' || variant === 'ghost' ? '#FFFFFF' : '#050505'} />
      ) : (
        <Text style={[styles.label, labelVariants[variant]]}>{label}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: theme.spacing.lg,
  },
  label: {
    ...theme.typography.button,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.55,
  },
});

const variants = StyleSheet.create({
  primary: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  secondary: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderStrong,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.border,
  },
  danger: {
    backgroundColor: '#1A0E0E',
    borderColor: '#3B1A1A',
  },
});

const labelVariants = StyleSheet.create({
  primary: {
    color: theme.colors.background,
  },
  secondary: {
    color: theme.colors.text,
  },
  ghost: {
    color: theme.colors.textMuted,
  },
  danger: {
    color: '#FFD6D6',
  },
});
