import { Fragment, MouseEvent, useRef, useState } from 'react';
import cn from 'classnames';

import { useForceUpdate } from '../../hooks';
import styles from './Octaves2.module.css';
import { printDeltas } from './reference.ts';
import { AudioResults, setupAudio } from './audio.ts';
import { KeyboardLayerType } from './types.ts';
import { usePressedKeys } from './logic.ts';

const START_FREQUENCY = 16.351875;

const NOTES = [
  { name: 'До', en: 'C', level: 1 },
  { name: 'Ре', en: 'D', level: 1.122424798379391 },
  { name: 'Ми', en: 'E', level: 1.2599090318388564 },
  { name: 'Фа', en: 'F', level: 1.334823988074762 },
  { name: 'Соль', en: 'G', level: 1.4982991247181134 },
  { name: 'Ля', en: 'A', level: 1.6817643236631885 },
  { name: 'Си', en: 'B', level: 1.8877040094790354 },
];

const OCTAVES = [
  'Субконтроктава',
  'Контроктава',
  'Большая октава',
  'Малая октава',
  'Первая октава',
  'Вторая октава',
  'Третья октава',
  'Четвертая октава',
  'Пятая октава',
];

export function Octaves2() {
  const forceUpdate = useForceUpdate();
  const [keyboardBindings] = useState(
    () => new Map<number, KeyboardLayerType>(),
  );
  const audioRef = useRef<AudioResults | undefined>();

  const pressedKeys = usePressedKeys();

  function onCellMouseEnter(event: MouseEvent, frequency: number): void {
    if (audioRef.current) {
      audioRef.current.osc.frequency.value = frequency;
      audioRef.current.gain.gain.value = Math.min(1, (3 * 20) / frequency);
    }

    document.querySelectorAll(styles.activeCell).forEach((element) => {
      element.classList.remove(styles.activeCell);
    });

    (event.target as HTMLDivElement).classList.add(styles.activeCell);
  }

  function onCellMouseLeave(event: MouseEvent): void {
    (event.target as HTMLDivElement).classList.remove(styles.activeCell);
  }

  return (
    <div
      className={styles.grid}
      onMouseEnter={() => {
        audioRef.current?.osc.start();
      }}
      onMouseLeave={() => {
        audioRef.current?.osc.stop();
        console.log('STOP');
      }}
      onClick={() => {
        audioRef.current = setupAudio();
      }}
    >
      <div>Octave name\Level</div>
      {NOTES.map(({ name, en }, index) => (
        <div key={index}>
          Level {index + 1}
          <br />
          {name}/{en}
        </div>
      ))}
      <div>Keyboard</div>
      {OCTAVES.map((octaveName, octaveIndex) => {
        const levelStart = START_FREQUENCY * 2 ** octaveIndex;

        const isHighLight = Math.floor(OCTAVES.length / octaveIndex) === 2;
        const className = cn({
          [styles.highlight]: isHighLight,
        });

        return (
          <Fragment key={octaveName}>
            <div className={className}>{octaveName}</div>
            {NOTES.map(({ level }, index) => {
              // const step = levelStart / NOTES.length;
              // const frequency = levelStart + step * index;
              const frequency = levelStart * level;

              return (
                <div
                  key={index}
                  className={className}
                  onMouseEnter={(event) => {
                    onCellMouseEnter(event, frequency);
                  }}
                  onMouseLeave={onCellMouseLeave}
                >
                  {frequency
                    .toFixed(frequency < 500 ? 1 : 0)
                    .replace(/\.0$/, '')}
                </div>
              );
            })}
            <KeyboardBinding
              value={keyboardBindings.get(octaveIndex)}
              onChange={(keyboardBindingType) => {
                if (keyboardBindingType) {
                  removeBinding(keyboardBindings, keyboardBindingType);
                  keyboardBindings.set(octaveIndex, keyboardBindingType);
                } else {
                  keyboardBindings.delete(octaveIndex);
                }
                forceUpdate();
              }}
            />
          </Fragment>
        );
      })}
    </div>
  );
}

function removeBinding(
  bindings: Map<number, KeyboardLayerType>,
  removeValue: KeyboardLayerType,
): void {
  for (const [key, value] of bindings) {
    if (value === removeValue) {
      bindings.delete(key);
    }
  }
}

type KeyboardBindingProps = {
  value: KeyboardLayerType | undefined;
  onChange: (value: KeyboardLayerType | undefined) => void;
};

const NONE_VALUE = '_none';

function KeyboardBinding({ value, onChange }: KeyboardBindingProps) {
  return (
    <select
      value={value ?? NONE_VALUE}
      onChange={(event) => {
        const updatedValue = event.target.value;

        if (updatedValue === NONE_VALUE) {
          onChange(undefined);
        } else {
          onChange(updatedValue as KeyboardLayerType);
        }
      }}
    >
      <option value={KeyboardLayerType.QWE}>qwe</option>
      <option value={KeyboardLayerType.ASD}>asd</option>
      <option value={KeyboardLayerType.ZXC}>zxc</option>
      <option value={NONE_VALUE}>none</option>
    </select>
  );
}

printDeltas();
