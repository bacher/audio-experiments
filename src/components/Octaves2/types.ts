export const enum KeyboardLayerType {
  QWE = 'QWE',
  ASD = 'ASD',
  ZXC = 'ZXC',
}

export type WaveFormType = 'sawtooth' | 'sine' | 'square' | 'triangle';

export type Settings = {
  showNames: boolean;
  showHertz: boolean;
  halfTones: boolean;
  showStep: boolean;
  showKey: boolean;
  waveFormType: WaveFormType;
};

export const defaultSettings: Settings = {
  showNames: true,
  showHertz: false,
  halfTones: false,
  showStep: false,
  showKey: true,
  waveFormType: 'sine',
};

export const volumeWaveFormMapper: Record<WaveFormType, number> = {
  ['sine']: 1,
  ['sawtooth']: 0.15,
  ['square']: 0.1,
  ['triangle']: 0.5,
};
