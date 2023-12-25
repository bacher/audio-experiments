import { useEffect, useState } from 'react';

import { KeyboardLayerType } from './types.ts';

function transformLettersIntoCodes(letters: string): string[] {
  return letters.split('').map((letter) => `Key${letter}`);
}

const KEYBOARD_ALIASES = new Map<KeyboardLayerType, string[]>([
  [
    KeyboardLayerType.QWE,
    [...transformLettersIntoCodes('QWERTYUIOP'), 'BracketLeft', 'BracketRight'],
  ],
  [
    KeyboardLayerType.ASD,
    [...transformLettersIntoCodes('ASDFGHJKL'), 'Semicolon', 'Quote', 'Enter'],
  ],
  [
    KeyboardLayerType.ZXC,
    [
      ...transformLettersIntoCodes('ZXCVBNM'),
      'Comma',
      'Period',
      'Slash',
      'ShiftRight',
    ],
  ],
]);

export type PressedKeys = Map<KeyboardLayerType, Set<number>>;

export function usePressedKeys({
  onChange,
}: {
  onChange: () => void;
}): PressedKeys {
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
      console.log(event.code);

      for (const [keyboard, keys] of KEYBOARD_ALIASES) {
        const index = keys.indexOf(event.code);
        if (index !== -1) {
          pressedKeys.get(keyboard)!.add(index);
          onChange();
          return;
        }
      }
    }

    function onKeyUp(event: KeyboardEvent) {
      for (const [keyboard, keys] of KEYBOARD_ALIASES) {
        const index = keys.indexOf(event.code);
        if (index !== -1) {
          pressedKeys.get(keyboard)!.delete(index);
          onChange();
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
  }, []);

  return pressedKeys;
}
