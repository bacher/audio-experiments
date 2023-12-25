let currentAudioContext: AudioContext | undefined;

export type AudioResults = {
  osc: OscillatorNode;
  gain: GainNode;
};

export function setupAudio(): AudioResults {
  if (currentAudioContext) {
    void currentAudioContext.close();
  }

  const audioContext = new AudioContext();
  currentAudioContext = audioContext;

  const osc = new OscillatorNode(audioContext, { frequency: 440 });

  const gain = new GainNode(audioContext, {
    gain: 0,
  });

  osc.connect(gain);
  gain.connect(audioContext.destination);

  osc.start();

  return {
    osc,
    gain,
  };
}
