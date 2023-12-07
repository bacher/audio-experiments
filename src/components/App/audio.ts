export type ControlShape = {
  gainParam: AudioParam;
  balanceParam: AudioParam;
  play: () => Promise<void>;
  destroy: () => Promise<void>;
};

export function init(audioElement: HTMLAudioElement): ControlShape {
  const audioContext = new AudioContext();

  const track = audioContext.createMediaElementSource(audioElement);

  const gainNode = audioContext.createGain();

  gainNode.gain.setValueAtTime(0.5, audioContext.currentTime + 2.5);

  const pannerOptions = { pan: 0 };
  const pannerNode = new StereoPannerNode(audioContext, pannerOptions);

  track.connect(gainNode).connect(pannerNode).connect(audioContext.destination);

  return {
    gainParam: gainNode.gain,
    balanceParam: pannerNode.pan,
    play: async () => {
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      await audioElement.play();
    },
    destroy: async () => {
      await audioContext.close();
    },
  };
}
