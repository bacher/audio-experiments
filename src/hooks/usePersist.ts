import { useState } from 'react';
import { identity } from 'lodash-es';

type Params<T> = {
  persistingKey: string;
  default: () => T;
  serialize?: (value: T) => unknown;
  deserialize?: (raw: unknown) => T;
};

export function usePersist<T>({
  persistingKey,
  default: getDefault,
  serialize = identity,
  deserialize = identity,
}: Params<T>): [T, () => void] {
  const [data] = useState<T>(() => {
    const rawData = window.localStorage.getItem(persistingKey);
    if (rawData) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const json = JSON.parse(rawData);
        return deserialize(json);
      } catch (error) {
        console.warn(error);
      }
    }

    return getDefault();
  });

  function onUpdate() {
    window.localStorage.setItem(persistingKey, JSON.stringify(serialize(data)));
  }

  return [data, onUpdate];
}
