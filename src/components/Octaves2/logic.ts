import { useEffect, useState } from 'react';
import { useForceUpdate } from '../../hooks';

import { KeyboardLayerType } from './types.ts';

function transformLettersIntoCodes(letters: string): string[] {
  return letters.split('').map((letter) => `Key${letter}`);
}

const KEYBOARD_ALIASES = new Map<KeyboardLayerType, string[]>([
  [KeyboardLayerType.QWE, transformLettersIntoCodes('QWERTYUIOP')],
  [KeyboardLayerType.ASD, transformLettersIntoCodes('ASDFGHJKL:')],
  [KeyboardLayerType.ZXC, transformLettersIntoCodes('ZXCVBNM<>?')],
]);

export function usePressedKeys() {
  const forceUpdate = useForceUpdate();

  const [pressedKeys] = useState(
    () =>
      new Map<KeyboardLayerType, Set<number>>([
        [KeyboardLayerType.QWE, new Set()],
        [KeyboardLayerType.ASD, new Set()],
        [KeyboardLayerType.ZXC, new Set()],
      ]),
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      for (const [keyboard, keys] of KEYBOARD_ALIASES) {
        const index = keys.indexOf(event.code);
        if (index !== -1) {
          pressedKeys.get(keyboard)!.add(index);
          forceUpdate();
          return;
        }
      }
    }

    function onKeyUp(event: KeyboardEvent) {
      for (const [keyboard, keys] of KEYBOARD_ALIASES) {
        const index = keys.indexOf(event.code);
        if (index !== -1) {
          pressedKeys.get(keyboard)!.delete(index);
          forceUpdate();
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
