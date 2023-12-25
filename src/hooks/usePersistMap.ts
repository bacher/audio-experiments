import { usePersist } from './usePersist.ts';

export function usePersistMap<T extends Map<unknown, unknown>>(
  persistingKey: string,
): [T, () => void] {
  return usePersist<T>({
    persistingKey,
    default: () => new Map() as T,
    serialize: (value) => [...value.entries()],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    deserialize: (raw) => new Map(raw as any[]) as T,
  });
}
