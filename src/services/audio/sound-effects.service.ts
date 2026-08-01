import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';

type SoundCue = 'phaseShift' | 'sessionComplete' | 'sessionCancel';

const sources: Record<SoundCue, number> = {
  phaseShift: require('../../../assets/audio/phase-shift.wav'),
  sessionComplete: require('../../../assets/audio/session-complete.wav'),
  sessionCancel: require('../../../assets/audio/session-cancel.wav'),
};

let prepared = false;
let players: Partial<Record<SoundCue, AudioPlayer>> = {};

const ensurePrepared = async () => {
  if (prepared) {
    return;
  }

  await setAudioModeAsync({
    interruptionMode: 'mixWithOthers',
    playsInSilentMode: false,
    shouldPlayInBackground: false,
  });

  players = {
    phaseShift: createAudioPlayer(sources.phaseShift, { keepAudioSessionActive: true }),
    sessionComplete: createAudioPlayer(sources.sessionComplete, { keepAudioSessionActive: true }),
    sessionCancel: createAudioPlayer(sources.sessionCancel, { keepAudioSessionActive: true }),
  };

  for (const player of Object.values(players)) {
    if (player) {
      player.volume = 0.9;
    }
  }

  prepared = true;
};

export const soundEffectsService = {
  async prepare() {
    await ensurePrepared();
  },

  async play(cue: SoundCue, enabled: boolean) {
    if (!enabled) {
      return;
    }

    await ensurePrepared();
    const player = players[cue];

    if (!player) {
      return;
    }

    try {
      await player.seekTo(0);
    } catch {
      // Ignore seek errors if the player has not fully loaded yet.
    }

    player.play();
  },

  dispose() {
    for (const player of Object.values(players)) {
      player?.remove();
    }

    players = {};
    prepared = false;
  },
};
