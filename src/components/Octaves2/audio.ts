let currentAudioContext: AudioContext | undefined;

export type AudioResults = {
  gain: GainNode;
  oscNodes: OscNodeEntity[];
};

export type OscNodeEntity = {
  osc: OscillatorNode;
  gain: GainNode;
  frequency: number;
  isActive: boolean;
};

const MAX_OSC_COUNT = 20;
const BASE_FREQUENCY = 440;

export function setupAudio(): AudioResults {
  if (currentAudioContext) {
    void currentAudioContext.close();
  }

  const audioContext = new AudioContext();
  currentAudioContext = audioContext;

  const finalGain = new GainNode(audioContext, {
    gain: 1,
  });

  const oscNodes: OscNodeEntity[] = [];

  for (let i = 0; i < MAX_OSC_COUNT; i += 1) {
    const osc = new OscillatorNode(audioContext, { frequency: BASE_FREQUENCY });
    const gain = new GainNode(audioContext, {
      gain: 0,
    });

    osc.connect(gain);
    gain.connect(finalGain);

    osc.start();

    oscNodes.push({
      osc,
      gain,
      frequency: BASE_FREQUENCY,
      isActive: false,
    });
  }

  finalGain.connect(audioContext.destination);

  return {
    oscNodes,
    gain: finalGain,
  };
}
