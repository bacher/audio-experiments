export const enum KeyboardLayerType {
  QWE = 'QWE',
  ASD = 'ASD',
  ZXC = 'ZXC',
}

export type Settings = {
  showNames: boolean;
  showHertz: boolean;
  halfTones: boolean;
  showStep: boolean;
};

export const defaultSettings = {
  showNames: true,
  showHertz: false,
  halfTones: false,
  showStep: false,
};
