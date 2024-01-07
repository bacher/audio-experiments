import { useState } from 'react';
import { identity } from 'lodash-es';

type Params<T> = {
  persistingKey: string;
  default: () => T;
  serialize?: (value: T) => unknown;
  deserialize?: (raw: unknown) => T;
};

export function usePersistState<T>({
  persistingKey,
  default: getDefault,
  serialize = identity,
  deserialize = identity,
}: Params<T>): [T, (value: T) => void] {
  const [data, setData] = useState<T>(() => {
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

  function onUpdate(newValue: T) {
    setData(newValue);
    window.localStorage.setItem(
      persistingKey,
      JSON.stringify(serialize(newValue)),
    );
  }

  return [data, onUpdate];
}
