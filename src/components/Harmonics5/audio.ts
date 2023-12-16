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

export function generatePeriodicWaveExample(audioContext: AudioContext) {
  const real = new Float32Array(2);
  const imag = new Float32Array(2);

  real[0] = 0;
  imag[0] = 0;
  real[1] = 1;
  imag[1] = 0;

  return new PeriodicWave(audioContext, {
    real,
    imag,
    disableNormalization: true,
  });
}

function generatePeriodicWave(
  audioContext: AudioContext,
  harmonics: Harmonic[],
) {
  const real = new Float32Array(harmonics.length + 1);
  const imag = new Float32Array(harmonics.length + 1);

  real[0] = 0;
  imag[0] = 0;

  for (const harmonic of harmonics) {
    const { index, amplify, shift } = harmonic;
    // const { frequency, delayTime } = getHarmonicParams(harmonic);

    let r;
    let i;

    // Graph Calculator
    // https://www.desmos.com/calculator/iq9nfpi76e

    if (shift < 0.25) {
      const interpolation = shift * 4;
      r = amplify * Math.sqrt(1 - interpolation);
      i = amplify * Math.sqrt(interpolation);
    } else if (shift < 0.5) {
      const interpolation = 1 - (shift - 0.25) * 4;
      r = amplify * Math.sqrt(1 - interpolation) * -1;
      i = amplify * Math.sqrt(interpolation);
    } else if (shift < 0.75) {
      const interpolation = (shift - 0.5) * 4;
      r = amplify * Math.sqrt(1 - interpolation) * -1;
      i = amplify * Math.sqrt(interpolation) * -1;
    } else {
      const interpolation = 1 - (shift - 0.75) * 4;
      r = amplify * Math.sqrt(1 - interpolation);
      i = amplify * Math.sqrt(interpolation) * -1;
    }

    real[index + 1] = r;
    imag[index + 1] = i;
  }

  return new PeriodicWave(audioContext, {
    real,
    imag,
    // disableNormalization: true,
  });
}

export type SetupResults = {
  osc: OscillatorNode;
  gain: GainNode;
  effectGain: GainNode;
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

  const effectGain = new GainNode(audioContext, {
    gain: 0,
  });

  const periodicWave = generatePeriodicWave(audioContext, harmonics);

  const osc = new OscillatorNode(audioContext, {
    frequency: 220,
    type: 'custom',
    periodicWave,
  });

  osc.connect(finalGain);
  finalGain.connect(effectGain);
  effectGain.connect(audioContext.destination);

  osc.start();

  return {
    osc,
    gain: finalGain,
    effectGain,
  };
}

export function applyAudioSettings(
  { osc, gain }: SetupResults,
  harmonics: Harmonic[],
  volume: number,
): void {
  if (!currentAudioContext) {
    return;
  }

  const periodicWave = generatePeriodicWave(currentAudioContext, harmonics);

  osc.setPeriodicWave(periodicWave);

  gain.gain.value = calculateVolume(volume);
}

export function experimentEffect(gainNode: GainNode): void {
  const cur = gainNode.context.currentTime;

  gainNode.gain.linearRampToValueAtTime(1, cur + 0.5);

  window.setTimeout(() => {
    gainNode.gain.linearRampToValueAtTime(
      0,
      gainNode.context.currentTime + 0.5,
    );
  }, 1000);
}

export function smoothEffect(gainNode: GainNode): void {
  const cur = gainNode.context.currentTime;

  gainNode.gain
    .linearRampToValueAtTime(1, cur + 0.25)
    .setTargetAtTime(0, cur + 0.25, 0.15);
}

export function smoothFlatEffect(gainNode: GainNode): void {
  const cur = gainNode.context.currentTime;

  gainNode.gain
    .linearRampToValueAtTime(1, cur + 0.5)
    .setTargetAtTime(0, cur + 1, 0.5);
}

export function squareEffect(gainNode: GainNode): void {
  const cur = gainNode.context.currentTime;
  gainNode.gain.setValueAtTime(1, cur).setValueAtTime(0, cur + 0.25);
}

export function rampEffect(gainNode: GainNode): void {
  const cur = gainNode.context.currentTime;
  gainNode.gain
    .linearRampToValueAtTime(1, cur + 0.5)
    .setValueAtTime(0, cur + 0.5);
}

export function reversedRampEffect(gainNode: GainNode): void {
  const cur = gainNode.context.currentTime;
  gainNode.gain.setValueAtTime(1, cur).linearRampToValueAtTime(0, cur + 0.5);
}

export function triangleEffect(gainNode: GainNode): void {
  const cur = gainNode.context.currentTime;
  gainNode.gain
    .linearRampToValueAtTime(1, cur + 0.25)
    .linearRampToValueAtTime(0, cur + 0.5);
}
