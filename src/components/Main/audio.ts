import type { MutableRefObject } from 'react';

import { waveform } from './warm-triangle.ts';

export type ControlShape = {
  gainParam: AudioParam;
  balanceParam: AudioParam;
  analyserBuffer: Uint8Array;
  freqAnalyserBuffer: Uint8Array;
  oscRef: MutableRefObject<OscillatorNode | undefined>;
  play: () => Promise<void>;
  playSweep: (time?: number) => void;
  toggle: (isPlay: boolean) => Promise<void>;
  destroy: () => Promise<void>;
  updateAnalyserData: () => void;
};

export async function init(
  audioElement: HTMLAudioElement,
): Promise<ControlShape> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  let isPlaying = false;

  const audioContext = new AudioContext();

  const sourceNode = audioContext.createMediaStreamSource(stream);
  const sourceGainNode = audioContext.createGain();
  sourceGainNode.gain.value = 4;

  console.log(sourceNode);

  sourceNode.connect(sourceGainNode);

  const track = audioContext.createMediaElementSource(audioElement);

  const wave = new PeriodicWave(audioContext, {
    real: waveform.real,
    imag: waveform.imag,
  });

  const gainNode = audioContext.createGain();
  gainNode.gain.value = 0.5;

  // gainNode.gain.setValueAtTime(0.5, audioContext.currentTime + 0.1);

  const pannerOptions = { pan: 0 };
  const pannerNode = new StereoPannerNode(audioContext, pannerOptions);

  const analyser = new AnalyserNode(audioContext, {
    // fftSize: 256,
    fftSize: 1024,
  });

  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteTimeDomainData(dataArray);

  const analyserFreq = new AnalyserNode(audioContext, {
    // fftSize: 128,
    fftSize: 1024,
  });

  const freqDataArray = new Uint8Array(analyserFreq.frequencyBinCount);
  analyserFreq.getByteFrequencyData(freqDataArray);

  const oscRef: MutableRefObject<OscillatorNode | undefined> = {
    current: undefined,
  };

  function playSweep(time: number = audioContext.currentTime) {
    const osc = new OscillatorNode(audioContext, {
      frequency: 220,
      type: 'sine',
      // periodicWave: wave,
    });
    osc.connect(gainNode);
    osc.start(time);
    osc.stop(time + 0.05);

    // const osc2 = new OscillatorNode(audioContext, {
    //   frequency: 440,
    //   type: 'sine',
    //   // periodicWave: wave,
    // });
    // osc2.connect(gainNode);
    // osc2.start(time);
    // osc2.stop(time + 60);

    const osc3 = new OscillatorNode(audioContext, {
      frequency: 660,
      type: 'sine',
      // periodicWave: wave,
    });
    osc3.connect(gainNode);
    osc3.start(time);
    osc3.stop(time + 0.05);

    // oscRef.current = osc3;

    // console.log('current gain:', gainNode.gain.value);
    // gainNode.gain.setTargetAtTime(1, time, 0.5);
  }

  // track
  sourceGainNode
    .connect(gainNode)
    .connect(pannerNode)
    .connect(analyser)
    .connect(analyserFreq);
  // .connect(audioContext.destination);

  return {
    gainParam: gainNode.gain,
    balanceParam: pannerNode.pan,
    analyserBuffer: dataArray,
    freqAnalyserBuffer: freqDataArray,
    oscRef,
    playSweep,
    play: async () => {
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      if (!isPlaying) {
        await audioElement.play();
      }
    },
    toggle: async (isPlay) => {
      if (isPlay === isPlaying) {
        return;
      }

      isPlaying = !isPlaying;
      // if (isPlaying) {
      //   await audioElement.play();
      // } else {
      //   audioElement.pause();
      // }
    },
    destroy: async () => {
      await audioContext.close();
    },
    updateAnalyserData: () => {
      analyser.getByteTimeDomainData(dataArray);
      analyserFreq.getByteFrequencyData(freqDataArray);
    },
  };
}
