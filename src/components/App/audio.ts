export type ControlShape = {
  gainParam: AudioParam;
  balanceParam: AudioParam;
  analyserBuffer: Uint8Array;
  freqAnalyserBuffer: Uint8Array;
  play: () => Promise<void>;
  toggle: (isPlay: boolean) => Promise<void>;
  destroy: () => Promise<void>;
  updateAnalyserData: () => void;
};

export function init(audioElement: HTMLAudioElement): ControlShape {
  let isPlaying = false;

  const audioContext = new AudioContext();

  const track = audioContext.createMediaElementSource(audioElement);

  const gainNode = audioContext.createGain();

  gainNode.gain.setValueAtTime(0.5, audioContext.currentTime + 2.5);

  const pannerOptions = { pan: 0 };
  const pannerNode = new StereoPannerNode(audioContext, pannerOptions);

  const analyser = new AnalyserNode(audioContext, {
    // fftSize: 256,
    fftSize: 1024,
  });

  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteTimeDomainData(dataArray);

  const analyserFreq = new AnalyserNode(audioContext, {
    fftSize: 256,
    // fftSize: 1024,
  });

  const freqDataArray = new Uint8Array(analyserFreq.frequencyBinCount);
  analyserFreq.getByteTimeDomainData(freqDataArray);

  track
    .connect(gainNode)
    .connect(pannerNode)
    .connect(analyser)
    .connect(analyserFreq)
    .connect(audioContext.destination);

  return {
    gainParam: gainNode.gain,
    balanceParam: pannerNode.pan,
    analyserBuffer: dataArray,
    freqAnalyserBuffer: freqDataArray,
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
      if (isPlaying) {
        await audioElement.play();
      } else {
        audioElement.pause();
      }
    },
    destroy: async () => {
      await audioContext.close();
    },
    updateAnalyserData: () => {
      analyser.getByteTimeDomainData(dataArray);
      analyserFreq.getByteTimeDomainData(freqDataArray);
    },
  };
}
