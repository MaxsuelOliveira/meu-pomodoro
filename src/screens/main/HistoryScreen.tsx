import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Screen } from '../../components/ui/Screen';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { useAppStore } from '../../store/app-store';
import { theme } from '../../shared/theme/theme';
import { formatShortDateTime } from '../../shared/utils/date';
import { formatFocusSummary } from '../../shared/utils/format';

const statusLabel: Record<string, string> = {
  active: 'ativa',
  completed: 'concluida',
  interrupted: 'interrompida',
  cancelled: 'cancelada',
};

export const HistoryScreen = () => {
  const sessions = useAppStore((state) => state.sessions);

  return (
    <Screen>
      <SectionHeader
        subtitle="Historico salvo localmente no aparelho."
        title="Sessoes recentes"
      />

      {sessions.length === 0 ? (
        <EmptyState
          description="As sessoes terminadas ou interrompidas vao aparecer aqui."
          title="Nada por enquanto"
        />
      ) : (
        sessions.map((session) => (
          <Card key={session.id}>
            <View style={styles.row}>
              <View style={styles.copy}>
                <Text style={styles.title}>{session.presetName}</Text>
                <Text style={styles.meta}>
                  {formatFocusSummary(session.focusMinutes, session.shortBreakMinutes, session.rounds)}
                </Text>
              </View>
              <Text style={styles.status}>{statusLabel[session.status] ?? session.status}</Text>
            </View>

            <Text style={styles.meta}>inicio {formatShortDateTime(session.startedAt)}</Text>
            {session.completedAt ? (
              <Text style={styles.meta}>fim {formatShortDateTime(session.completedAt)}</Text>
            ) : null}
            {session.interruptionReason ? <Text style={styles.reason}>{session.interruptionReason}</Text> : null}
          </Card>
        ))
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.text,
  },
  status: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  meta: {
    ...theme.typography.small,
    color: theme.colors.textSoft,
  },
  reason: {
    ...theme.typography.small,
    color: '#FFD6D6',
  },
});
