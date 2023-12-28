import { useEffect, useRef, useState } from 'react';

import { KeyboardLayerType } from './types.ts';

function transformLettersIntoCodes(letters: string): string[] {
  return letters.split('').map((letter) => `Key${letter}`);
}

type KeyboardAliases = {
  codes: string[];
  keys: string[];
};

export const KEYBOARD_ALIASES = new Map<KeyboardLayerType, KeyboardAliases>([
  [
    KeyboardLayerType.QWE,
    {
      codes: [
        ...transformLettersIntoCodes('QWERTYUIOP'),
        'BracketLeft',
        'BracketRight',
      ],
      keys: [...'QWERTYUIOP[]'.split('')],
    },
  ],
  [
    KeyboardLayerType.ASD,
    {
      codes: [
        ...transformLettersIntoCodes('ASDFGHJKL'),
        'Semicolon',
        'Quote',
        'Enter',
      ],
      keys: [..."ASDFGHJKL;'".split(''), 'Enter'],
    },
  ],
  [
    KeyboardLayerType.ZXC,
    {
      codes: [
        ...transformLettersIntoCodes('ZXCVBNM'),
        'Comma',
        'Period',
        'Slash',
        'ShiftRight',
      ],
      keys: [...'ZXCVBNM,./'.split(''), 'Shift'],
    },
  ],
]);

export type PressedKeys = Map<KeyboardLayerType, Set<number>>;

export function usePressedKeys({
  onChange,
}: {
  onChange: () => void;
}): PressedKeys {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [pressedKeys] = useState<PressedKeys>(
    () =>
      new Map([
        [KeyboardLayerType.QWE, new Set()],
        [KeyboardLayerType.ASD, new Set()],
        [KeyboardLayerType.ZXC, new Set()],
      ]),
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      for (const [keyboard, { codes }] of KEYBOARD_ALIASES) {
        const index = codes.indexOf(event.code);
        if (index !== -1) {
          pressedKeys.get(keyboard)!.add(index);
          onChangeRef.current();
          return;
        }
      }
    }

    function onKeyUp(event: KeyboardEvent) {
      for (const [keyboard, { codes }] of KEYBOARD_ALIASES) {
        const index = codes.indexOf(event.code);
        if (index !== -1) {
          pressedKeys.get(keyboard)!.delete(index);
          onChangeRef.current();
          return;
        }
      }
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [pressedKeys]);

  return pressedKeys;
}
