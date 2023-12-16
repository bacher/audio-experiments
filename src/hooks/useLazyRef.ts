import { MutableRefObject, useRef, useState } from 'react';

export function useLazyRef<T>(initFunc: () => T): MutableRefObject<T> {
  const [initialValue] = useState(initFunc);
  return useRef(initialValue);
}
