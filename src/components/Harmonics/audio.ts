import type { Harmonic } from './types.ts';

let currentAudioContext: AudioContext | undefined;

export async function stopAudio(): Promise<void> {
  if (currentAudioContext) {
    const audioContext = currentAudioContext;
    currentAudioContext = undefined;
    await audioContext.close();
  }
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function playAudio(
  harmonics: Harmonic[],
  volume: number,
): Promise<void> {
  void stopAudio();

  const audioContext = new AudioContext();
  currentAudioContext = audioContext;

  const finalGain = new GainNode(audioContext, {
    gain: 0.3 * Math.min(1, volume),
  });

  if (volume > 1) {
    console.log('Volume cap reacted:', volume.toFixed(3));
  }

  finalGain.connect(audioContext.destination);

  const oscNodes = harmonics
    .filter((harmonic) => harmonic.amplify > 0)
    .map((harmonic) => {
      const freq = 220 * (harmonic.index + 1);
      const period = 1 / freq;

      const osc = new OscillatorNode(audioContext, {
        frequency: freq,
        type: 'sine',
      });

      const delay = period * harmonic.shift;

      const gain = new GainNode(audioContext, {
        gain: harmonic.amplify,
      });

      osc.connect(gain);
      gain.connect(finalGain);

      return {
        osc,
        delay,
      };
    });

  console.log('=== START ===');

  const currentTime = audioContext.currentTime;

  console.time('start');
  for (const { osc, delay } of oscNodes) {
    osc.start(currentTime + 0.001 + delay);
  }
  console.timeEnd('start');
}
