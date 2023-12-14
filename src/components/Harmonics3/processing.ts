import { Harmonic } from './types.ts';

export function processHarmonics(
  harmonics: Harmonic[],
  discretization: number,
) {
  const values = Array.from({ length: discretization }, () => 0);

  let maxValue = 0;
  let area = 0;

  for (let x = 0; x <= discretization; x += 1) {
    const rad = (x / discretization) * 2 * Math.PI;
    let value = 0;

    for (const harmonic of harmonics) {
      if (harmonic.amplify !== 0) {
        const m = harmonic.index + 1;
        value +=
          harmonic.amplify * Math.sin(m * rad + harmonic.shift * 2 * Math.PI);
      }
    }

    values[x] = value;

    const absValue = Math.abs(value);

    area += absValue;

    if (absValue >= maxValue) {
      maxValue = absValue;
    }
  }

  return {
    values,
    maxLevel: maxValue,
    avgLevel: area / discretization,
  };
}
