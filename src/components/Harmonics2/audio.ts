import { clamp } from 'lodash-es';

import type { Harmonic } from './types.ts';

let currentAudioContext: AudioContext | undefined;

export async function stopAudio(): Promise<void> {
  if (currentAudioContext) {
    const audioContext = currentAudioContext;
    currentAudioContext = undefined;
    await audioContext.close();
  }
}

export type HarmonicNode = {
  osc: OscillatorNode;
  gain: GainNode;
};

export type SetupResults = {
  harmonicsNodes: HarmonicNode[];
  gain: GainNode;
};

export function setupAudio(
  harmonics: Harmonic[],
  volume: number,
): SetupResults {
  // void stopAudio();

  const audioContext = new AudioContext();
  currentAudioContext = audioContext;

  const finalGain = new GainNode(audioContext, {
    gain: 0.3 * clamp(volume, 0, 1),
  });

  if (volume > 1) {
    console.log('Volume cap reacted:', volume.toFixed(3));
  }

  finalGain.connect(audioContext.destination);

  const harmonicsNodes = harmonics
    // .filter((harmonic) => harmonic.amplify > 0)
    .map((harmonic) => {
      const freq = 220 * (harmonic.index + 1);

      const osc = new OscillatorNode(audioContext, {
        frequency: freq,
        type: 'sine',
        detune: 100 * harmonic.shift,
      });

      const gain = new GainNode(audioContext, {
        gain: harmonic.amplify,
      });

      osc.connect(gain);
      gain.connect(finalGain);

      return {
        osc,
        gain,
      };
    });

  const currentTime = audioContext.currentTime + 0.005;
  for (const { osc } of harmonicsNodes) {
    osc.start(currentTime);
  }

  return {
    harmonicsNodes,
    gain: finalGain,
  };
}

export function applyAudioSettings(
  { harmonicsNodes, gain }: SetupResults,
  harmonics: Harmonic[],
  volume: number,
): void {
  for (let i = 0; i < harmonicsNodes.length; i += 1) {
    const { osc, gain } = harmonicsNodes[i];
    const { amplify, shift } = harmonics[i];

    osc.detune.value = 100 * shift;
    gain.gain.value = amplify;
  }

  gain.gain.value = 0.3 * clamp(volume, 0, 1);
}
