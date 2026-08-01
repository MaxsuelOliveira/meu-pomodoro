import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Screen } from '../../components/ui/Screen';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { StatPill } from '../../components/ui/StatPill';
import { useDashboard } from '../../hooks/use-dashboard';
import { theme } from '../../shared/theme/theme';
import { formatFocusSummary, formatMinutes, fromBooleanNumber } from '../../shared/utils/format';
import type { RootStackParamList } from '../../navigation/types';

export const DashboardScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { currentUser, dashboard, presets, activeSession, startSession } = useDashboard();

  return (
    <Screen>
      <SectionHeader
        subtitle="Tudo local, escuro e sem ruído."
        title={currentUser ? `Ola, ${currentUser.name}` : 'Seu foco'}
      />

      <View style={styles.statsRow}>
        <StatPill label="Hoje" value={formatMinutes(dashboard.todayFocusMinutes)} />
        <StatPill label="Sessoes" value={String(dashboard.completedSessions)} />
        <StatPill label="Sequencia" value={`${dashboard.streakDays} dias`} />
      </View>

      <SectionHeader
        subtitle="Comece rapido por um timer salvo."
        title="Seus blocos de foco"
      />

      {presets.length === 0 ? (
        <EmptyState
          description="Crie o primeiro timer na aba Timers para iniciar sua rotina."
          title="Nenhum timer salvo"
        />
      ) : (
        presets.map((preset) => (
          <Card key={preset.id}>
            <View style={styles.presetHeader}>
              <View style={styles.presetCopy}>
                <Text style={styles.cardTitle}>{preset.name}</Text>
                <Text style={styles.cardDescription}>
                  {formatFocusSummary(preset.focusMinutes, preset.shortBreakMinutes, preset.rounds)}
                </Text>
                <Text style={styles.supporting}>
                  {fromBooleanNumber(preset.strictMode)
                    ? 'modo estrito ligado'
                    : 'modo flexivel para pausas controladas'}
                </Text>
              </View>
            </View>

            <Button
              label="Iniciar agora"
              onPress={async () => {
                try {
                  if (activeSession) {
                    navigation.navigate('FocusSession');
                    return;
                  }

                  await startSession(preset.id);
                  navigation.navigate('FocusSession');
                } catch (error) {
                  Alert.alert('Nao foi possivel iniciar', 'Tente novamente em instantes.');
                }
              }}
            />
          </Card>
        ))
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  cardTitle: {
    ...theme.typography.title,
    color: theme.colors.text,
  },
  cardDescription: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
  supporting: {
    ...theme.typography.small,
    color: theme.colors.textSoft,
  },
  presetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  presetCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
});
