export function signalToRadial({
  signal,
  stepOrder,
  discretization,
}: {
  signal: number[];
  stepOrder: number;
  discretization: number;
}): (number | undefined)[] {
  const valuesData = Array.from({ length: discretization }, () => ({
    sum: 0,
    count: 0,
  }));

  const cycle = 1 - stepOrder;

  const iteration = (signal.length * cycle) / discretization / 10;

  for (let i = 0; i <= signal.length - 1; i += iteration) {
    const placeOnCycle = ((i / signal.length) % cycle) / cycle;

    const signalValue = lookup(signal, i);

    const index = Math.floor(placeOnCycle * valuesData.length);

    valuesData[index].sum += signalValue;
    valuesData[index].count += 1;
  }

  const values = processArray(valuesData);

  normalizeArray(values);

  return values;
}

function lookup(values: number[], index: number): number {
  const nearDown = Math.floor(index);
  const nearUp = Math.ceil(index);

  if (nearDown >= values.length) {
    throw new Error();
  }

  if (nearUp >= values.length) {
    return values[values.length - 1];
  }

  const down = values[nearDown];
  const up = values[nearUp];

  const fract = index % 1;

  const out = (1 - fract) * down + fract * up;

  if (Number.isNaN(out)) {
    throw new Error();
  }

  return out;
}

function processArray(
  valuesData: { sum: number; count: number }[],
): (number | undefined)[] {
  const values: (number | undefined)[] = Array.from({
    length: valuesData.length,
  });

  for (let i = 0; i < valuesData.length; i += 1) {
    const { sum, count } = valuesData[i];

    if (count === 0) {
      values[i] = undefined;
    } else {
      values[i] = sum / count;
    }
  }

  return values;
}

function normalizeArray(array: (number | undefined)[]): void {
  let max = 0;

  for (const current of array) {
    if (current !== undefined) {
      const absCurrent = Math.abs(current);
      if (absCurrent > max) {
        max = absCurrent;
      }
    }
  }

  if (max !== 0) {
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < array.length; i += 1) {
      if (array[i] !== undefined) {
        array[i]! /= max;
      }
    }
  }
}
