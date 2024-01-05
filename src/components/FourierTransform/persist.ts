import { Harmonic, HARMONICS_VERSION } from './types.ts';

const keyName = 'audio_harmonics';

export function loadHarmonicsFromLocalStorage(): Harmonic[] | undefined {
  const json = localStorage.getItem(keyName);

  if (json) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data = JSON.parse(json);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (data.version === HARMONICS_VERSION) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return data.harmonics as Harmonic[];
      }
    } catch (error) {
      console.error(error);
    }
  }

  return undefined;
}

export function persistHarmonicsToLocalStorage(harmonics: Harmonic[]): void {
  localStorage.setItem(
    keyName,
    JSON.stringify({
      version: HARMONICS_VERSION,
      harmonics,
    }),
  );
}
