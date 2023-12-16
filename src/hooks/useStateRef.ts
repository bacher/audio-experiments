import { MutableRefObject, useRef, useState } from 'react';

export function useStateRef<T>(
  initFunc: () => T,
): [MutableRefObject<T>, (value: T) => void] {
  const [value, setValue] = useState(initFunc);
  const ref = useRef(value);

  return [
    ref,
    (updatedValue) => {
      ref.current = updatedValue;
      setValue(updatedValue);
    },
  ];
}
