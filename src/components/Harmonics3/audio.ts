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

function calculateVolume(volume: number): number {
  return (0.3 * clamp(volume, 0, 3)) / 2;
}

function getHarmonicParams(harmonic: Harmonic) {
  const frequency = 220 * (harmonic.index + 1);
  const period = 1 / frequency;
  const delayTime = period * harmonic.shift;

  return {
    frequency,
    period,
    delayTime,
  };
}

export type HarmonicNode = {
  osc: OscillatorNode;
  delay: DelayNode;
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
    gain: calculateVolume(volume),
  });

  if (volume > 1) {
    console.log('Volume cap reacted:', volume.toFixed(3));
  }

  finalGain.connect(audioContext.destination);

  const harmonicsNodes = harmonics
    // .filter((harmonic) => harmonic.amplify > 0)
    .map((harmonic) => {
      const { frequency, delayTime } = getHarmonicParams(harmonic);

      const osc = new OscillatorNode(audioContext, {
        frequency,
        type: 'sine',
      });

      const gain = new GainNode(audioContext, {
        gain: harmonic.amplify,
      });

      const delay = new DelayNode(audioContext, {
        delayTime: delayTime,
      });

      osc.connect(delay);
      delay.connect(gain);
      gain.connect(finalGain);

      return {
        osc,
        delay,
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
    const { delay, gain } = harmonicsNodes[i];
    const harmonic = harmonics[i];
    const { delayTime } = getHarmonicParams(harmonic);

    delay.delayTime.value = delayTime;
    gain.gain.value = harmonic.amplify;
  }

  gain.gain.value = calculateVolume(volume);
}
