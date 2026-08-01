import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Screen } from '../../components/ui/Screen';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { TextField } from '../../components/ui/TextField';
import { usePresets } from '../../hooks/use-presets';
import type { SavePresetInput } from '../../shared/types/entities';
import { theme } from '../../shared/theme/theme';
import { formatFocusSummary, fromBooleanNumber } from '../../shared/utils/format';

const emptyPreset: SavePresetInput = {
  name: '',
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  rounds: 4,
  strictMode: true,
};

export const PresetsScreen = () => {
  const { presets, savePreset, deletePreset } = usePresets();
  const [draft, setDraft] = useState<SavePresetInput>(emptyPreset);

  useEffect(() => {
    if (!draft.id) {
      return;
    }

    const current = presets.find((preset) => preset.id === draft.id);

    if (!current) {
      setDraft(emptyPreset);
    }
  }, [draft.id, presets]);

  const commitPreset = async () => {
    if (draft.name.trim().length < 2) {
      Alert.alert('Nome curto', 'Escolha um nome simples para este timer.');
      return;
    }

    await savePreset(draft);
    setDraft(emptyPreset);
  };

  return (
    <Screen>
      <SectionHeader
        subtitle="Crie, edite e exclua timers com o minimo de ruido visual."
        title="Timers"
      />

      <Card>
        <Text style={styles.cardTitle}>{draft.id ? 'Editar timer' : 'Novo timer'}</Text>

        <TextField
          label="Nome"
          onChangeText={(name) => setDraft((current) => ({ ...current, name }))}
          placeholder="Ex.: Manha profunda"
          value={draft.name}
        />

        <View style={styles.row}>
          <TextField
            keyboardType="number-pad"
            label="Foco"
            onChangeText={(value) =>
              setDraft((current) => ({ ...current, focusMinutes: Number(value || 0) || 0 }))
            }
            value={String(draft.focusMinutes)}
          />
          <TextField
            keyboardType="number-pad"
            label="Pausa"
            onChangeText={(value) =>
              setDraft((current) => ({ ...current, shortBreakMinutes: Number(value || 0) || 0 }))
            }
            value={String(draft.shortBreakMinutes)}
          />
        </View>

        <View style={styles.row}>
          <TextField
            keyboardType="number-pad"
            label="Pausa longa"
            onChangeText={(value) =>
              setDraft((current) => ({ ...current, longBreakMinutes: Number(value || 0) || 0 }))
            }
            value={String(draft.longBreakMinutes)}
          />
          <TextField
            keyboardType="number-pad"
            label="Ciclos"
            onChangeText={(value) =>
              setDraft((current) => ({ ...current, rounds: Number(value || 0) || 0 }))
            }
            value={String(draft.rounds)}
          />
        </View>

        <View style={styles.actions}>
          <Button
            label={draft.strictMode ? 'Modo estrito ligado' : 'Modo flexivel'}
            onPress={() =>
              setDraft((current) => ({
                ...current,
                strictMode: !current.strictMode,
              }))
            }
            variant="secondary"
          />
          <Button label={draft.id ? 'Salvar alteracoes' : 'Salvar timer'} onPress={commitPreset} />
          {draft.id ? (
            <Button
              label="Cancelar edicao"
              onPress={() => setDraft(emptyPreset)}
              variant="ghost"
            />
          ) : null}
        </View>
      </Card>

      {presets.length === 0 ? (
        <EmptyState
          description="Os timers padrao aparecem apos criar a conta. Edite ou crie outros por aqui."
          title="Sem timers"
        />
      ) : (
        presets.map((preset) => (
          <Card key={preset.id}>
            <Text style={styles.cardTitle}>{preset.name}</Text>
            <Text style={styles.meta}>
              {formatFocusSummary(preset.focusMinutes, preset.shortBreakMinutes, preset.rounds)}
            </Text>
            <Text style={styles.supporting}>
              {fromBooleanNumber(preset.strictMode) ? 'estrito' : 'flexivel'}
            </Text>

            <View style={styles.inlineActions}>
              <Button
                label="Editar"
                onPress={() =>
                  setDraft({
                    id: preset.id,
                    name: preset.name,
                    focusMinutes: preset.focusMinutes,
                    shortBreakMinutes: preset.shortBreakMinutes,
                    longBreakMinutes: preset.longBreakMinutes,
                    rounds: preset.rounds,
                    strictMode: fromBooleanNumber(preset.strictMode),
                  })
                }
                variant="secondary"
              />
              <Button
                label="Excluir"
                onPress={() =>
                  Alert.alert('Excluir timer', 'Deseja remover este timer salvo?', [
                    { style: 'cancel', text: 'Cancelar' },
                    {
                      style: 'destructive',
                      text: 'Excluir',
                      onPress: () => deletePreset(preset.id),
                    },
                  ])
                }
                variant="danger"
              />
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  cardTitle: {
    ...theme.typography.title,
    color: theme.colors.text,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actions: {
    gap: theme.spacing.sm,
  },
  inlineActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  meta: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
  supporting: {
    ...theme.typography.small,
    color: theme.colors.textSoft,
    textTransform: 'uppercase',
  },
});
