import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { formatClock } from '../../shared/utils/format';
import type { SessionPhase } from '../../shared/types/entities';
import { sessionPhasePalette } from '../../shared/theme/session-phase-theme';
import { theme } from '../../shared/theme/theme';

interface TimerRingProps {
  label: string;
  currentCycle: number;
  totalCycles: number;
  progress: number;
  remainingSeconds: number;
  phase: SessionPhase;
  lockedLabel: string;
}

export const TimerRing = ({
  label,
  currentCycle,
  totalCycles,
  progress,
  remainingSeconds,
  phase,
  lockedLabel,
}: TimerRingProps) => {
  const pulse = useRef(new Animated.Value(0)).current;
  const orbit = useRef(new Animated.Value(0)).current;
  const orbitReverse = useRef(new Animated.Value(0)).current;
  const tick = useRef(new Animated.Value(0)).current;
  const colorShift = useRef(new Animated.Value(1)).current;
  const { width } = useWindowDimensions();
  const fromPaletteRef = useRef(sessionPhasePalette[phase]);
  const toPaletteRef = useRef(sessionPhasePalette[phase]);

  const circleSize = useMemo(() => Math.min(width - theme.spacing.lg * 2, 392), [width]);
  const haloSize = circleSize + 24;
  const clockFontSize = Math.round(circleSize * 0.28);
  const clockLineHeight = Math.round(clockFontSize * 1.02);
  const progressLabel = Math.round(progress * 100);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          duration: 2200,
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
  }, [pulse]);

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(orbit, {
        duration: 12000,
        easing: Easing.linear,
        toValue: 1,
        useNativeDriver: true,
      })
    );

    spin.start();

    return () => {
      spin.stop();
    };
  }, [orbit]);

  useEffect(() => {
    const reverseSpin = Animated.loop(
      Animated.timing(orbitReverse, {
        duration: 18000,
        easing: Easing.linear,
        toValue: 1,
        useNativeDriver: true,
      })
    );

    reverseSpin.start();

    return () => {
      reverseSpin.stop();
    };
  }, [orbitReverse]);

  useEffect(() => {
    if (toPaletteRef.current === sessionPhasePalette[phase]) {
      return;
    }

    fromPaletteRef.current = toPaletteRef.current;
    toPaletteRef.current = sessionPhasePalette[phase];
    colorShift.setValue(0);

    Animated.timing(colorShift, {
      duration: 780,
      easing: Easing.out(Easing.cubic),
      toValue: 1,
      useNativeDriver: false,
    }).start();
  }, [colorShift, phase]);

  useEffect(() => {
    tick.setValue(0);

    Animated.sequence([
      Animated.timing(tick, {
        duration: 180,
        easing: Easing.out(Easing.ease),
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(tick, {
        duration: 240,
        easing: Easing.inOut(Easing.ease),
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  }, [remainingSeconds, tick]);

  const haloOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.16, 0.3],
  });

  const haloScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1.05],
  });

  const progressWidth = useMemo(() => `${Math.max(4, progress * 100)}%` as `${number}%`, [progress]);
  const isBreak = phase !== 'focus';
  const orbitRotation = orbit.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const orbitRotationReverse = orbitReverse.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });
  const tickScale = tick.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.04],
  });
  const tickOpacity = tick.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.92],
  });
  const fromPalette = fromPaletteRef.current;
  const toPalette = toPaletteRef.current;
  const accentColor = colorShift.interpolate({
    inputRange: [0, 1],
    outputRange: [fromPalette.accent, toPalette.accent],
  });
  const accentSoft = colorShift.interpolate({
    inputRange: [0, 1],
    outputRange: [fromPalette.accentSoft, toPalette.accentSoft],
  });
  const accentGlow = colorShift.interpolate({
    inputRange: [0, 1],
    outputRange: [fromPalette.accentGlow, toPalette.accentGlow],
  });
  const circleBackground = colorShift.interpolate({
    inputRange: [0, 1],
    outputRange: [fromPalette.circleBackground, toPalette.circleBackground],
  });
  const remainingMinutes = Math.max(1, Math.ceil(remainingSeconds / 60));

  return (
    <View style={styles.wrapper}>
      <View style={[styles.stage, { minHeight: haloSize + 30 }]}>
        <Animated.View
          style={[
            styles.halo,
            {
              backgroundColor: accentSoft,
              height: haloSize,
              opacity: haloOpacity,
              transform: [{ scale: haloScale }],
              width: haloSize,
            },
          ]}
        />

        <Animated.View
          style={[
            styles.orbitRing,
            {
              borderColor: accentSoft,
              height: circleSize + 8,
              transform: [{ rotate: orbitRotation }],
              width: circleSize + 8,
            },
          ]}
        >
          <Animated.View style={[styles.orbitDot, { backgroundColor: accentColor }]} />
        </Animated.View>

        <Animated.View
          style={[
            styles.orbitRingSecondary,
            {
              borderColor: accentGlow,
              height: circleSize - 20,
              transform: [{ rotate: orbitRotationReverse }],
              width: circleSize - 20,
            },
          ]}
        >
          <Animated.View style={[styles.orbitDotSmall, { backgroundColor: accentColor }]} />
        </Animated.View>

        <Animated.View
          style={[
            styles.circle,
            {
              borderColor: accentSoft,
              backgroundColor: circleBackground,
              height: circleSize,
              width: circleSize,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.coreGlow,
              {
                backgroundColor: accentGlow,
                opacity: haloOpacity,
                transform: [{ scale: haloScale }],
              },
            ]}
          />
          <Animated.View style={[styles.innerEdge, { borderColor: accentSoft }]} />

          <View style={styles.chipsRow}>
            <Animated.View style={[styles.chip, { backgroundColor: accentColor }]}>
              <Text style={styles.chipText}>{label}</Text>
            </Animated.View>
            <View style={[styles.chip, styles.chipMuted]}>
              <Text style={styles.chipTextMuted}>{lockedLabel}</Text>
            </View>
          </View>

          <Animated.Text
            style={[
              styles.clock,
              {
                fontSize: clockFontSize,
                lineHeight: clockLineHeight,
                opacity: tickOpacity,
                transform: [{ scale: tickScale }],
              },
            ]}
          >
            {formatClock(remainingSeconds)}
          </Animated.Text>
          <Animated.Text style={[styles.cycle, { color: accentColor }]}>
            ciclo {currentCycle}/{totalCycles}
          </Animated.Text>
          <View style={styles.metricsRow}>
            <Text style={styles.metricText}>fase {progressLabel}%</Text>
            <Text style={styles.metricDivider}>/</Text>
            <Text style={styles.metricText}>restam {remainingMinutes} min</Text>
          </View>
        </Animated.View>
      </View>

      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: accentColor,
              width: progressWidth,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  halo: {
    borderRadius: 999,
    position: 'absolute',
  },
  orbitRing: {
    alignItems: 'center',
    borderRadius: 999,
    borderStyle: 'dashed',
    borderWidth: 1,
    justifyContent: 'flex-start',
    paddingTop: 6,
    position: 'absolute',
  },
  orbitRingSecondary: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'flex-end',
    paddingBottom: 10,
    position: 'absolute',
  },
  orbitDot: {
    borderRadius: 999,
    height: 12,
    width: 12,
  },
  orbitDotSmall: {
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  circle: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  coreGlow: {
    borderRadius: 999,
    height: '58%',
    position: 'absolute',
    width: '58%',
  },
  innerEdge: {
    borderRadius: 999,
    borderWidth: 1,
    bottom: 12,
    left: 12,
    opacity: 0.45,
    position: 'absolute',
    right: 12,
    top: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  chip: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
  },
  chipMuted: {
    backgroundColor: theme.colors.surfaceStrong,
  },
  chipText: {
    ...theme.typography.small,
    color: theme.colors.background,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  chipTextMuted: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  clock: {
    fontFamily: 'SpaceGrotesk_700Bold',
    letterSpacing: -3.4,
    color: theme.colors.text,
  },
  cycle: {
    ...theme.typography.title,
    marginTop: theme.spacing.sm,
    textTransform: 'uppercase',
  },
  metricsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  },
  metricText: {
    ...theme.typography.small,
    color: theme.colors.textSoft,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  metricDivider: {
    ...theme.typography.small,
    color: theme.colors.textSoft,
  },
  progressTrack: {
    backgroundColor: '#111111',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: '#1D1D1D',
    height: 12,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    borderRadius: theme.radius.pill,
    height: '100%',
  },
});
