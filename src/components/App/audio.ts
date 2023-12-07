export type ControlShape = {
  play: () => Promise<void>;
};

export function init(audioElement: HTMLAudioElement): ControlShape {
  const audioContext = new AudioContext();

  const track = audioContext.createMediaElementSource(audioElement);

  track.connect(audioContext.destination);

  return {
    play: async () => {
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      await audioElement.play();
    },
  };
}
