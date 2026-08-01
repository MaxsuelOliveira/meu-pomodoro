import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  AppState,
  BackHandler,
  Easing,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { TimerRing } from '../../components/ui/TimerRing';
import { usePomodoroSession } from '../../hooks/use-pomodoro-session';
import type { RootStackParamList } from '../../navigation/types';
import { soundEffectsService } from '../../services/audio/sound-effects.service';
import type { SessionPhase, SessionStatus } from '../../shared/types/entities';
import { sessionPhasePalette } from '../../shared/theme/session-phase-theme';
import { theme } from '../../shared/theme/theme';
import { fromBooleanNumber } from '../../shared/utils/format';
import { focusModeService } from '../../services/focus/focus-mode.service';

const phaseLabel: Record<string, string> = {
  focus: 'foco',
  shortBreak: 'pausa curta',
  longBreak: 'pausa longa',
};

const SHEET_HANDLE_PEEK = 28;

const ImmersiveActionButton = ({
  title,
  subtitle,
  icon,
  onPress,
  disabled = false,
  tone = 'primary',
}: {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  disabled?: boolean;
  tone?: 'primary' | 'danger';
}) => {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        tone === 'primary' ? styles.actionPrimary : styles.actionDanger,
        disabled ? styles.actionDisabled : null,
        pressed && !disabled ? styles.actionPressed : null,
      ]}
    >
      <View style={[styles.actionIconWrap, tone === 'primary' ? styles.actionIconWrapPrimary : styles.actionIconWrapDanger]}>
        <Ionicons
          color={tone === 'primary' ? '#0B1202' : '#FFDAD4'}
          name={icon}
          size={18}
        />
      </View>

      <View style={styles.actionCopy}>
        <Text style={[styles.actionTitle, tone === 'primary' ? styles.actionTitlePrimary : styles.actionTitleDanger]}>
          {title}
        </Text>
        <Text style={[styles.actionSubtitle, tone === 'primary' ? styles.actionSubtitlePrimary : null]}>
          {subtitle}
        </Text>
      </View>

      <Ionicons
        color={tone === 'primary' ? '#2B4207' : theme.colors.textMuted}
        name={disabled ? 'lock-closed' : 'arrow-forward'}
        size={18}
      />
    </Pressable>
  );
};

export const FocusSessionScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { activeSession, settings, phase, elapsedSeconds, isCompleted, totalDuration, finishSession } =
    usePomodoroSession();
  const insets = useSafeAreaInsets();
  const intro = useRef(new Animated.Value(0)).current;
  const ambient = useRef(new Animated.Value(0)).current;
  const phaseMotion = useRef(new Animated.Value(1)).current;
  const phaseFlash = useRef(new Animated.Value(0)).current;
  const actionFlash = useRef(new Animated.Value(0)).current;
  const actionLockRef = useRef(false);
  const lastPhaseRef = useRef<SessionPhase | null>(null);
  const [actionFlashTone, setActionFlashTone] = useState<'success' | 'danger'>('success');
  const [sheetHeight, setSheetHeight] = useState(0);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const sheetOffset = useRef(new Animated.Value(0)).current;
  const sheetOffsetRef = useRef(0);
  const sheetDragStartRef = useRef(0);

  const collapsedSheetOffset = Math.max(0, sheetHeight - SHEET_HANDLE_PEEK);

  const runAnimation = useCallback((animation: Animated.CompositeAnimation) => {
    return new Promise<void>((resolve) => {
      animation.start(() => resolve());
    });
  }, []);

  const snapSheet = useCallback(
    (expanded: boolean) => {
      const target = expanded ? 0 : collapsedSheetOffset;
      setIsSheetExpanded(expanded);
      sheetOffsetRef.current = target;

      Animated.spring(sheetOffset, {
        damping: 12,
        toValue: target,
        mass: 0.82,
        overshootClamping: false,
        restDisplacementThreshold: 0.2,
        restSpeedThreshold: 0.2,
        stiffness: 180,
        useNativeDriver: true,
      }).start();
    },
    [collapsedSheetOffset, sheetOffset]
  );

  const triggerHaptic = useCallback(
    (pattern: number | number[]) => {
      if (settings?.hapticsEnabled !== 1) {
        return;
      }

      Vibration.vibrate(pattern);
    },
    [settings?.hapticsEnabled]
  );

  useEffect(() => {
    focusModeService.enter();

    return () => {
      focusModeService.exit();
    };
  }, []);

  useEffect(() => {
    if (settings?.keepScreenAwake !== 1) {
      return;
    }

    activateKeepAwakeAsync();

    return () => {
      deactivateKeepAwake();
    };
  }, [settings?.keepScreenAwake]);

  useEffect(() => {
    void soundEffectsService.prepare();

    return () => {
      soundEffectsService.dispose();
    };
  }, []);

  useEffect(() => {
    Animated.timing(intro, {
      duration: 720,
      easing: Easing.out(Easing.cubic),
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [intro]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(ambient, {
          duration: 4800,
          easing: Easing.inOut(Easing.ease),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(ambient, {
          duration: 4800,
          easing: Easing.inOut(Easing.ease),
          toValue: 0,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    return () => {
      loop.stop();
    };
  }, [ambient]);

  useEffect(() => {
    if (!phase) {
      lastPhaseRef.current = null;
      return;
    }

    const previousPhase = lastPhaseRef.current;
    lastPhaseRef.current = phase.phase;

    if (!previousPhase || previousPhase === phase.phase) {
      return;
    }

    void soundEffectsService.play('phaseShift', settings?.soundEffectsEnabled === 1);

    phaseMotion.setValue(0);
    phaseFlash.setValue(0.22);

    Animated.parallel([
      Animated.spring(phaseMotion, {
        toValue: 1,
        friction: 7,
        tension: 85,
        useNativeDriver: true,
      }),
      Animated.timing(phaseFlash, {
        duration: 720,
        easing: Easing.out(Easing.cubic),
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  }, [phase, phaseFlash, phaseMotion, settings?.soundEffectsEnabled]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => subscription.remove();
    }, [])
  );

  useEffect(() => {
    if (activeSession) {
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [activeSession, navigation]);

  useEffect(() => {
    if (!activeSession || !settings) {
      return;
    }

    const subscription = AppState.addEventListener('change', async (nextState) => {
      const isBreakPhase = phase?.phase === 'shortBreak' || phase?.phase === 'longBreak';
      const mustLock =
        isBreakPhase || settings.lockSessionOnBackground === 1 || activeSession.strictMode === 1;

      if (mustLock && nextState !== 'active') {
        await finishSession('interrupted', 'Sessao interrompida ao sair do app.');
      }
    });

    return () => subscription.remove();
  }, [activeSession, finishSession, phase?.phase, settings]);

  const finalizeSessionWithFeedback = useCallback(
    async (
      status: Extract<SessionStatus, 'completed' | 'cancelled'>,
      reason: string | null,
      tone: 'success' | 'danger'
    ) => {
      if (actionLockRef.current) {
        return;
      }

      actionLockRef.current = true;
      setActionFlashTone(tone);
      void soundEffectsService.play(
        tone === 'success' ? 'sessionComplete' : 'sessionCancel',
        settings?.soundEffectsEnabled === 1
      );

      triggerHaptic(
        tone === 'success'
          ? [0, 40, 35, 60]
          : [0, 50, 45, 50, 45, 70]
      );

      actionFlash.setValue(tone === 'success' ? 0.3 : 0.24);

      await runAnimation(
        Animated.timing(actionFlash, {
          duration: 280,
          easing: Easing.out(Easing.quad),
          toValue: 0,
          useNativeDriver: true,
        })
      );

      await finishSession(status, reason);
      actionLockRef.current = false;
    },
    [actionFlash, finishSession, runAnimation, settings?.soundEffectsEnabled, triggerHaptic]
  );

  useEffect(() => {
    if (!activeSession || !isCompleted) {
      return;
    }

    void finalizeSessionWithFeedback('completed', null, 'success');
  }, [activeSession, finalizeSessionWithFeedback, isCompleted]);

  useEffect(() => {
    if (!sheetHeight) {
      return;
    }

    const target = isSheetExpanded ? 0 : collapsedSheetOffset;
    sheetOffset.setValue(target);
    sheetOffsetRef.current = target;
  }, [collapsedSheetOffset, isSheetExpanded, sheetHeight, sheetOffset]);

  if (!activeSession || !phase || !settings) {
    return (
      <SafeAreaView style={styles.fallbackSafeArea}>
        <View style={styles.fallbackState}>
          <Text style={styles.fallbackTitle}>Nenhuma sessao ativa.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const strictMode = fromBooleanNumber(activeSession.strictMode);
  const isBreak = phase.phase === 'shortBreak' || phase.phase === 'longBreak';
  const completion = totalDuration > 0 ? Math.min(1, elapsedSeconds / totalDuration) : 0;
  const completionLabel = `${Math.round(completion * 100)}% da sessao`;
  const phaseMinutesLeft = Math.max(1, Math.ceil(phase.remainingSeconds / 60));
  const palette = sessionPhasePalette[phase.phase];
  const focusAccent = palette.accent;
  const accentSoft = palette.accentSoft;
  const lockTone = isBreak ? 'pausa blindada' : strictMode ? 'modo estrito' : 'fluxo protegido';
  const lockHint = isBreak
    ? 'A pausa segue travada. Sair do app durante a recuperacao quebra o ciclo.'
    : strictMode
      ? 'Sem voltar, trocar de tela ou abrir outros apps ate o fim.'
      : 'O app segue protegendo sua cadencia e empurrando voce de volta para o foco.';
  const canCompleteNow = !isBreak;
  const introStyle = {
    opacity: intro,
    transform: [
      {
        translateY: intro.interpolate({
          inputRange: [0, 1],
          outputRange: [24, 0],
        }),
      },
    ],
  };
  const topOrbStyle = {
    opacity: ambient.interpolate({
      inputRange: [0, 1],
      outputRange: [0.65, 1],
    }),
    transform: [
      {
        translateY: ambient.interpolate({
          inputRange: [0, 1],
          outputRange: [-8, 12],
        }),
      },
    ],
  };
  const centerOrbStyle = {
    opacity: ambient.interpolate({
      inputRange: [0, 1],
      outputRange: [0.45, 0.82],
    }),
    transform: [
      {
        translateX: ambient.interpolate({
          inputRange: [0, 1],
          outputRange: [-12, 10],
        }),
      },
    ],
  };
  const bottomOrbStyle = {
    opacity: ambient.interpolate({
      inputRange: [0, 1],
      outputRange: [0.55, 0.92],
    }),
    transform: [
      {
        translateY: ambient.interpolate({
          inputRange: [0, 1],
          outputRange: [10, -10],
        }),
      },
    ],
  };
  const overlayLineStyle = {
    opacity: ambient.interpolate({
      inputRange: [0, 1],
      outputRange: [0.4, 0.95],
    }),
    transform: [
      {
        scaleX: ambient.interpolate({
          inputRange: [0, 1],
          outputRange: [0.92, 1.02],
        }),
      },
    ],
  };
  const overlayVisibility = collapsedSheetOffset
    ? sheetOffset.interpolate({
        inputRange: [0, collapsedSheetOffset],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      })
    : 1;
  const overlayTranslateStyle = {
    transform: [
      {
        translateY: Animated.add(
          intro.interpolate({
            inputRange: [0, 1],
            outputRange: [30, 0],
          }),
          sheetOffset
        ),
      },
    ],
  };
  const phaseTransitionStyle = {
    opacity: phaseMotion,
    transform: [
      {
        translateY: phaseMotion.interpolate({
          inputRange: [0, 1],
          outputRange: [14, 0],
        }),
      },
      {
        scale: phaseMotion.interpolate({
          inputRange: [0, 1],
          outputRange: [0.985, 1],
        }),
      },
    ],
  };
  const phaseFlashStyle = {
    opacity: phaseFlash,
  };
  const actionFlashStyle = {
    opacity: actionFlash,
  };
  const panResponder = useMemo(
    () =>
      PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > 8 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
      onPanResponderGrant: () => {
        sheetOffset.stopAnimation((value) => {
          sheetDragStartRef.current = value;
          sheetOffsetRef.current = value;
        });
      },
      onPanResponderMove: (_, gestureState) => {
        const nextValue = Math.max(
          0,
          Math.min(collapsedSheetOffset, sheetDragStartRef.current + gestureState.dy)
        );

        sheetOffset.setValue(nextValue);
        sheetOffsetRef.current = nextValue;
      },
      onPanResponderRelease: (_, gestureState) => {
        const shouldExpand =
          gestureState.dy < -42 ||
          gestureState.vy < -0.35 ||
          sheetOffsetRef.current < collapsedSheetOffset * 0.58;

        snapSheet(shouldExpand);
      },
      onPanResponderTerminate: () => {
        snapSheet(sheetOffsetRef.current < collapsedSheetOffset * 0.58);
      },
      }),
    [collapsedSheetOffset, snapSheet]
  );

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <StatusBar hidden style="light" />

      <View style={styles.root}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.phaseFlashOverlay,
            { backgroundColor: `${focusAccent}40` },
            phaseFlashStyle,
          ]}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.actionFlashOverlay,
            {
              backgroundColor:
                actionFlashTone === 'success'
                  ? 'rgba(198, 255, 99, 0.28)'
                  : 'rgba(255, 109, 91, 0.22)',
            },
            actionFlashStyle,
          ]}
        />
        <Animated.View
          style={[
            styles.backgroundOrb,
            styles.backgroundOrbTop,
            { backgroundColor: `${focusAccent}1F` },
            topOrbStyle,
          ]}
        />
        <Animated.View
          style={[
            styles.backgroundOrb,
            styles.backgroundOrbCenter,
            { backgroundColor: `${focusAccent}12` },
            centerOrbStyle,
          ]}
        />
        <Animated.View
          style={[
            styles.backgroundOrb,
            styles.backgroundOrbBottom,
            { backgroundColor: `${focusAccent}18` },
            bottomOrbStyle,
          ]}
        />

        <ScrollView
          bounces={false}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top, 18) + 12,
              paddingBottom: 260 + insets.bottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.heroBlock, introStyle, phaseTransitionStyle]}>
            <View style={[styles.lockBadge, { backgroundColor: `${focusAccent}22`, borderColor: `${focusAccent}4D` }]}>
              <Ionicons color={focusAccent} name={isBreak ? 'moon' : 'lock-closed'} size={14} />
              <Text style={[styles.lockBadgeText, { color: focusAccent }]}>{lockTone}</Text>
            </View>

            <Text style={styles.eyebrow}>{isBreak ? 'pausa travada' : 'modo foco'}</Text>
            <Text style={styles.title}>{activeSession.presetName}</Text>
            <Text style={styles.subtitle}>
              {isBreak
                ? 'Recupere sem escapar do ritual. O retorno ao foco continua blindado.'
                : strictMode
                  ? 'Uma sessao sem desvios, com volta forcada ao centro da tarefa.'
                  : 'Foco profundo com presenca total e uma interface feita para sustentar o ritmo.'}
            </Text>
            <View style={styles.heroStatsRow}>
              <View style={[styles.heroStatChip, { borderColor: `${focusAccent}2E`, backgroundColor: accentSoft }]}>
                <Text style={[styles.heroStatLabel, { color: focusAccent }]}>ciclo</Text>
                <Text style={styles.heroStatValue}>
                  {phase.cycle}/{activeSession.rounds}
                </Text>
              </View>
              <View style={styles.heroStatChip}>
                <Text style={styles.heroStatLabel}>preset</Text>
                <Text style={styles.heroStatValue}>{activeSession.focusMinutes} min</Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View style={[introStyle, phaseTransitionStyle]}>
            <TimerRing
              currentCycle={phase.cycle}
              label={phaseLabel[phase.phase] ?? phase.phase}
              lockedLabel={isBreak ? 'break lock' : strictMode ? 'strict lock' : 'flow lock'}
              phase={phase.phase}
              progress={phase.progress}
              remainingSeconds={phase.remainingSeconds}
              totalCycles={activeSession.rounds}
            />
          </Animated.View>

          <Animated.View style={[styles.metricsGrid, introStyle, phaseTransitionStyle]}>
            <View style={styles.metricPanel}>
              <Text style={styles.metricLabel}>sessao</Text>
              <Text style={styles.metricValue}>{completionLabel}</Text>
            </View>
            <View style={styles.metricPanel}>
              <Text style={styles.metricLabel}>fase</Text>
              <Text style={styles.metricValue}>{phaseMinutesLeft} min restantes</Text>
            </View>
            <View style={styles.metricPanel}>
              <Text style={styles.metricLabel}>bloqueio</Text>
              <Text style={styles.metricValue}>
                {strictMode || isBreak ? 'saida encerra o ciclo' : 'saida quebra a cadencia'}
              </Text>
            </View>
            <View style={styles.metricPanel}>
              <Text style={styles.metricLabel}>tela</Text>
              <Text style={styles.metricValue}>
                {settings.keepScreenAwake === 1 ? 'sempre acesa' : 'comportamento normal'}
              </Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.phaseCallout, introStyle, phaseTransitionStyle]}>
            <Ionicons color={focusAccent} name={isBreak ? 'leaf' : 'flash'} size={18} />
            <Text style={styles.phaseCalloutText}>
              {isBreak
                ? 'Pausa protegida em andamento. Respire, recupere e volte no tempo certo.'
                : 'Janela de foco aberta. Mantenha a linha e feche esta rodada forte.'}
            </Text>
          </Animated.View>
        </ScrollView>

        <Animated.View pointerEvents="none" style={[styles.overlayScrim, { opacity: overlayVisibility }]} />

        <Animated.View
          onLayout={(event) => {
            const nextHeight = event.nativeEvent.layout.height;

            if (nextHeight > 0 && Math.round(nextHeight) !== Math.round(sheetHeight)) {
              setSheetHeight(nextHeight);
            }
          }}
          style={[
            styles.overlayShell,
            overlayTranslateStyle,
            {
              opacity: sheetHeight ? 1 : 0,
              paddingBottom: Math.max(insets.bottom, 14) + theme.spacing.md,
            },
          ]}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              styles.overlayHighlight,
              { backgroundColor: focusAccent },
              overlayLineStyle,
            ]}
          />
          <Pressable
            hitSlop={12}
            onPress={() => snapSheet(!isSheetExpanded)}
            style={styles.overlayHandleTouch}
            {...panResponder.panHandlers}
          >
            <View style={styles.overlayHandleContent}>
              <Ionicons
                color={focusAccent}
                name={isSheetExpanded ? 'chevron-down' : 'chevron-up'}
                size={16}
              />
              <Text style={[styles.overlayHandleLabel, { color: focusAccent }]}>
                {isSheetExpanded ? 'arraste para baixo' : 'puxe para cima'}
              </Text>
            </View>
          </Pressable>
          <View style={styles.overlayCard}>
            <View style={styles.overlayHeader}>
              <View style={styles.overlayCopy}>
                <Text style={styles.overlayTitle}>
                  {canCompleteNow ? 'Concluir agora' : 'Pausa protegida ate acabar'}
                </Text>
                <Text style={styles.overlaySubtitle}>{lockHint}</Text>
              </View>
              <View style={[styles.overlayAccent, { backgroundColor: `${focusAccent}24`, borderColor: `${focusAccent}44` }]}>
                <Text style={[styles.overlayAccentText, { color: focusAccent }]}>
                  {phaseLabel[phase.phase] ?? phase.phase}
                </Text>
              </View>
            </View>

            <View style={styles.overlayActions}>
              <ImmersiveActionButton
                disabled={!canCompleteNow}
                icon={canCompleteNow ? 'checkmark-circle' : 'lock-closed'}
                onPress={
                  canCompleteNow
                    ? () => void finalizeSessionWithFeedback('completed', null, 'success')
                    : undefined
                }
                subtitle={
                  canCompleteNow
                    ? 'Finaliza a sessao e salva este bloco como concluido.'
                    : 'A conclusao manual fica bloqueada durante a pausa protegida.'
                }
                title={canCompleteNow ? 'Concluir ciclo agora' : 'Aguardar fim da pausa'}
                tone="primary"
              />

              <ImmersiveActionButton
                icon="close-circle"
                onPress={() =>
                  Alert.alert(
                    'Interromper sessao',
                    isBreak
                      ? 'Mesmo na pausa, interromper agora quebra o ciclo inteiro. Deseja continuar?'
                      : 'Deseja realmente interromper este modo foco agora?',
                    [
                      { style: 'cancel', text: isBreak ? 'Manter a pausa' : 'Continuar focado' },
                      {
                        style: 'destructive',
                        text: 'Interromper',
                        onPress: () =>
                          void finalizeSessionWithFeedback(
                            'cancelled',
                            'Sessao encerrada manualmente.',
                            'danger'
                          ),
                      },
                    ]
                  )
                }
                subtitle="Encerra a blindagem e cancela o ritual inteiro desta rodada."
                title="Interromper sessao"
                tone="danger"
              />
            </View>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  root: {
    backgroundColor: theme.colors.background,
    flex: 1,
    overflow: 'hidden',
  },
  phaseFlashOverlay: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  actionFlashOverlay: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  fallbackSafeArea: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  fallbackState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  fallbackTitle: {
    ...theme.typography.heading,
    color: theme.colors.text,
    textAlign: 'center',
  },
  backgroundOrb: {
    borderRadius: 999,
    position: 'absolute',
  },
  backgroundOrbTop: {
    height: 240,
    right: -60,
    top: -10,
    width: 240,
  },
  backgroundOrbCenter: {
    height: 340,
    left: -120,
    top: '28%',
    width: 340,
  },
  backgroundOrbBottom: {
    bottom: 70,
    height: 220,
    right: -80,
    width: 220,
  },
  scrollContent: {
    gap: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  heroBlock: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  heroStatChip: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    gap: 2,
    minWidth: 112,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
  },
  heroStatLabel: {
    ...theme.typography.small,
    color: theme.colors.textSoft,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroStatValue: {
    ...theme.typography.title,
    color: theme.colors.text,
  },
  lockBadge: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
  },
  lockBadgeText: {
    ...theme.typography.small,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  eyebrow: {
    ...theme.typography.small,
    color: theme.colors.textSoft,
    letterSpacing: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  title: {
    ...theme.typography.display,
    color: theme.colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    maxWidth: 340,
    textAlign: 'center',
  },
  metricsGrid: {
    gap: theme.spacing.sm,
  },
  metricPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: 4,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  metricLabel: {
    ...theme.typography.small,
    color: theme.colors.textSoft,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  metricValue: {
    ...theme.typography.title,
    color: theme.colors.text,
  },
  phaseCallout: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  phaseCalloutText: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    flex: 1,
  },
  overlayScrim: {
    backgroundColor: 'rgba(5, 5, 5, 0.78)',
    bottom: 0,
    height: 220,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  overlayShell: {
    bottom: 0,
    left: 0,
    paddingHorizontal: theme.spacing.lg,
    position: 'absolute',
    right: 0,
    paddingTop: 48,
  },
  overlayHighlight: {
    alignSelf: 'center',
    borderRadius: theme.radius.pill,
    height: 4,
    marginBottom: 12,
    width: '42%',
  },
  overlayHandleTouch: {
    alignItems: 'center',
    alignSelf: 'center',
    height: 34,
    justifyContent: 'center',
    marginBottom: 6,
    width: '56%',
  },
  overlayHandleContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  overlayHandleLabel: {
    ...theme.typography.small,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  overlayCard: {
    backgroundColor: 'rgba(9, 9, 9, 0.92)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 28,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -16 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 24,
  },
  overlayHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  overlayCopy: {
    flex: 1,
    gap: 4,
  },
  overlayTitle: {
    ...theme.typography.title,
    color: theme.colors.text,
  },
  overlaySubtitle: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
  },
  overlayAccent: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
  },
  overlayAccentText: {
    ...theme.typography.small,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  overlayActions: {
    gap: theme.spacing.sm,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.md,
    minHeight: 76,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 14,
  },
  actionPrimary: {
    backgroundColor: '#C6FF63',
    borderColor: '#C6FF63',
  },
  actionDanger: {
    backgroundColor: '#1B1010',
    borderColor: '#3D1E1E',
  },
  actionDisabled: {
    opacity: 0.68,
  },
  actionPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  actionIconWrap: {
    alignItems: 'center',
    borderRadius: 18,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  actionIconWrapPrimary: {
    backgroundColor: 'rgba(11, 18, 2, 0.12)',
  },
  actionIconWrapDanger: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  actionCopy: {
    flex: 1,
    gap: 3,
  },
  actionTitle: {
    ...theme.typography.title,
  },
  actionTitlePrimary: {
    color: '#0B1202',
  },
  actionTitleDanger: {
    color: '#FFDAD4',
  },
  actionSubtitle: {
    ...theme.typography.small,
    color: theme.colors.textSoft,
  },
  actionSubtitlePrimary: {
    color: '#294108',
  },
});
