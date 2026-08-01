import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Screen } from '../../components/ui/Screen';
import { TextField } from '../../components/ui/TextField';
import { theme } from '../../shared/theme/theme';
import { useAuth } from '../../hooks/use-auth';

const authSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Use um email valido.'),
  password: z.string().min(4, 'Use ao menos 4 caracteres.'),
});

type AuthFormValues = z.infer<typeof authSchema>;

export const AuthScreen = () => {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const { login, register, status, errorMessage, clearError } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const isLoading = status === 'loading';

  const onSubmit = handleSubmit(async (values) => {
    clearError();

    if (mode === 'register') {
      if (!values.name || values.name.trim().length < 2) {
        return;
      }

      await register({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      return;
    }

    await login({
      email: values.email,
      password: values.password,
    });
  });

  return (
    <Screen
      footer={
        <View style={styles.footer}>
          <Button
            label={mode === 'register' ? 'Criar conta local' : 'Entrar'}
            loading={isLoading}
            onPress={onSubmit}
          />
          <Button
            label={mode === 'register' ? 'Ja tenho conta' : 'Criar nova conta'}
            onPress={() => {
              setMode((current) => (current === 'register' ? 'login' : 'register'));
              clearError();
            }}
            variant="ghost"
          />
        </View>
      }
    >
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>minimal focus</Text>
        <Text style={styles.title}>Pomodoro escuro, limpo e local.</Text>
        <Text style={styles.subtitle}>
          Login, perfil, timers e historico salvos no aparelho com uma interface enxuta.
        </Text>
      </View>

      <Card>
        <Text style={styles.cardTitle}>{mode === 'register' ? 'Criar perfil' : 'Entrar no app'}</Text>

        {mode === 'register' ? (
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <TextField
                autoCapitalize="words"
                label="Nome"
                onChangeText={onChange}
                placeholder="Seu nome"
                value={value}
              />
            )}
          />
        ) : null}

        <Controller
          control={control}
          name="email"
          rules={{
            validate: (value) => authSchema.shape.email.safeParse(value).success || 'Use um email valido.',
          }}
          render={({ field: { onChange, value } }) => (
            <TextField
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email?.message}
              keyboardType="email-address"
              label="Email"
              onChangeText={onChange}
              placeholder="voce@email.com"
              value={value}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{
            validate: (value) =>
              authSchema.shape.password.safeParse(value).success || 'Use ao menos 4 caracteres.',
          }}
          render={({ field: { onChange, value } }) => (
            <TextField
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.password?.message}
              label="Senha"
              onChangeText={onChange}
              placeholder="Sua senha local"
              secureTextEntry
              value={value}
            />
          )}
        />

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        {mode === 'register' ? (
          <Text style={styles.supporting}>
            O login e os dados ficam salvos localmente no aparelho usando banco SQLite e sessao segura.
          </Text>
        ) : null}
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  hero: {
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.xl,
  },
  eyebrow: {
    ...theme.typography.small,
    color: theme.colors.textSoft,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    ...theme.typography.display,
    color: theme.colors.text,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    maxWidth: 320,
  },
  cardTitle: {
    ...theme.typography.title,
    color: theme.colors.text,
  },
  supporting: {
    ...theme.typography.small,
    color: theme.colors.textSoft,
  },
  errorText: {
    ...theme.typography.small,
    color: '#FFD6D6',
  },
  footer: {
    gap: theme.spacing.sm,
  },
});
