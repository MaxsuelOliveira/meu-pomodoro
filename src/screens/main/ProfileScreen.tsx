import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { biometricService } from '../../services/biometric/biometric.service';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Screen } from '../../components/ui/Screen';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { SwitchRow } from '../../components/ui/SwitchRow';
import { TextField } from '../../components/ui/TextField';
import { useAuth } from '../../hooks/use-auth';
import { useSettings } from '../../hooks/use-settings';
import { theme } from '../../shared/theme/theme';
import { useAppStore } from '../../store/app-store';

export const ProfileScreen = () => {
  const { currentUser, logout } = useAuth();
  const { settingsViewModel, updateSettings } = useSettings();
  const updateProfile = useAppStore((state) => state.updateProfile);
  const [profileDraft, setProfileDraft] = useState({
    name: currentUser?.name ?? '',
    email: currentUser?.email ?? '',
  });
  const [settingsDraft, setSettingsDraft] = useState(settingsViewModel);

  useEffect(() => {
    setProfileDraft({
      name: currentUser?.name ?? '',
      email: currentUser?.email ?? '',
    });
  }, [currentUser]);

  useEffect(() => {
    setSettingsDraft(settingsViewModel);
  }, [settingsViewModel]);

  if (!currentUser || !settingsDraft) {
    return null;
  }

  return (
    <Screen>
      <SectionHeader
        subtitle="Perfil local e preferencias persistidas no proprio aparelho."
        title="Perfil"
      />

      <Card>
        <Text style={styles.cardTitle}>Conta local</Text>
        <TextField
          autoCapitalize="words"
          label="Nome"
          onChangeText={(name) => setProfileDraft((current) => ({ ...current, name }))}
          value={profileDraft.name}
        />
        <TextField
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          label="Email"
          onChangeText={(email) => setProfileDraft((current) => ({ ...current, email }))}
          value={profileDraft.email}
        />
        <Button
          label="Salvar perfil"
          onPress={() => updateProfile(profileDraft)}
        />
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Preferencias</Text>
        <TextField
          keyboardType="number-pad"
          label="Meta diaria em minutos"
          onChangeText={(value) =>
            setSettingsDraft((current) =>
              current
                ? {
                    ...current,
                    dailyGoalMinutes: Number(value || 0) || 0,
                  }
                : current
            )
          }
          value={String(settingsDraft.dailyGoalMinutes)}
        />

        <SwitchRow
          description="Mantem a tela ativa durante uma sessao."
          onValueChange={(keepScreenAwake) =>
            setSettingsDraft((current) => (current ? { ...current, keepScreenAwake } : current))
          }
          title="Tela sempre ligada"
          value={settingsDraft.keepScreenAwake}
        />
        <SwitchRow
          description="Agenda um aviso local ao final do ciclo."
          onValueChange={(notificationsEnabled) =>
            setSettingsDraft((current) =>
              current ? { ...current, notificationsEnabled } : current
            )
          }
          title="Notificacao local"
          value={settingsDraft.notificationsEnabled}
        />
        <SwitchRow
          description="Toca efeitos curtos nas trocas de fase e no fim da sessao."
          onValueChange={(soundEffectsEnabled) =>
            setSettingsDraft((current) =>
              current ? { ...current, soundEffectsEnabled } : current
            )
          }
          title="Sons do foco"
          value={settingsDraft.soundEffectsEnabled}
        />
        <SwitchRow
          description="Interrompe a sessao se voce sair do app."
          onValueChange={(lockSessionOnBackground) =>
            setSettingsDraft((current) =>
              current ? { ...current, lockSessionOnBackground } : current
            )
          }
          title="Bloqueio ao sair"
          value={settingsDraft.lockSessionOnBackground}
        />
        <SwitchRow
          description="Usa biometria como camada extra quando suportado."
          onValueChange={(requireBiometrics) =>
            setSettingsDraft((current) =>
              current ? { ...current, requireBiometrics } : current
            )
          }
          title="Biometria"
          value={settingsDraft.requireBiometrics}
        />

        <Button
          label="Salvar preferencias"
          onPress={() => updateSettings(settingsDraft)}
        />
        <Button
          label="Testar biometria"
          onPress={async () => {
            const success = await biometricService.authenticate();
            Alert.alert(
              success ? 'Biometria ok' : 'Biometria indisponivel',
              success
                ? 'A autenticacao biometrica respondeu corretamente.'
                : 'Nao foi possivel autenticar neste aparelho.'
            );
          }}
          variant="secondary"
        />
      </Card>

      <Card>
        <Text style={styles.supporting}>
          O app trabalha com isolamento forte dentro do React Native, mas nao consegue bloquear
          o sistema inteiro do celular como um modo administrador faria.
        </Text>
        <Button
          label="Sair da conta"
          onPress={() =>
            Alert.alert('Sair', 'Deseja encerrar a sessao local neste aparelho?', [
              { style: 'cancel', text: 'Cancelar' },
              {
                style: 'destructive',
                text: 'Sair',
                onPress: () => logout(),
              },
            ])
          }
          variant="ghost"
        />
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  cardTitle: {
    ...theme.typography.title,
    color: theme.colors.text,
  },
  supporting: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
});
