import { CSSProperties, Fragment, useRef } from 'react';
import cn from 'classnames';

import { useForceUpdate } from '../../hooks';
import { usePersistMap } from '../../hooks/usePersistMap.ts';
import { usePersist } from '../../hooks/usePersist.ts';

import {
  defaultSettings,
  KeyboardLayerType,
  Settings,
  volumeWaveFormMapper,
} from './types.ts';
import { AudioResults, OscNodeEntity, setupAudio } from './audio.ts';
import { PressedKeys, usePressedKeys } from './usePressedKeys.ts';
import styles from './Octaves3.module.css';
import { SettingsPanel } from './SettingsPanel.tsx';

const START_FREQUENCY = 16.351875;

type Note = {
  name: string;
  en: string;
  level: number;
};

const NOTES: Note[] = [
  { name: 'До', en: 'C', level: 1 },
  { name: 'Ре', en: 'D', level: 1.122424798379391 },
  { name: 'Ми', en: 'E', level: 1.2599090318388564 },
  { name: 'Фа', en: 'F', level: 1.334823988074762 },
  { name: 'Соль', en: 'G', level: 1.4982991247181134 },
  { name: 'Ля', en: 'A', level: 1.6817643236631885 },
  { name: 'Си', en: 'B', level: 1.8877040094790354 },
];

const NOTES_FULL: Note[] = [
  { name: 'До', en: 'C', level: 1 },
  { name: 'До#', en: 'C#', level: 1.0594422700587085 },
  { name: 'Ре', en: 'D', level: 1.122424798379391 },
  { name: 'Ре#', en: 'D#', level: 1.1891511741682974 },
  { name: 'Ми', en: 'E', level: 1.2599090318388564 },
  { name: 'Фа', en: 'F', level: 1.334823988074762 },
  { name: 'Фа#', en: 'F#', level: 1.4142000978473581 },
  { name: 'Соль', en: 'G', level: 1.4982991247181134 },
  { name: 'Соль#', en: 'G#', level: 1.5873899217221135 },
  { name: 'Ля', en: 'A', level: 1.6817643236631885 },
  { name: 'Ля#', en: 'A#', level: 1.7817392367906066 },
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

export type KeyboardBindings = Map<number, KeyboardLayerType>;

export function Octaves3() {
  const forceUpdate = useForceUpdate();

  const [keyboardBindings, onKeyboardBindingsUpdated] =
    usePersistMap<KeyboardBindings>('audio_keyboard_bindings');

  const [settings, onSettingsUpdated] = usePersist<Settings>({
    persistingKey: 'audio_settings',
    default: () => defaultSettings,
  });

  const activeMouseCellRef = useRef<
    { octaveIndex: number; index: number } | undefined
  >(undefined);

  const notes = settings.halfTones ? NOTES_FULL : NOTES;

  const audioRef = useRef<AudioResults | undefined>();

  const pressedKeys = usePressedKeys({
    onChange: () => {
      safeInit();
      applyChangesLocal();
      forceUpdate();
    },
  });

  function applyChangesLocal() {
    if (audioRef.current) {
      applyChanges(
        audioRef.current,
        notes,
        pressedKeys,
        keyboardBindings,
        activeMouseCellRef.current,
      );
    }
  }

  function safeInit() {
    if (!audioRef.current) {
      const waveFormType = settings.waveFormType ?? 'sine';

      audioRef.current = setupAudio({
        waveFormType,
        volume: volumeWaveFormMapper[waveFormType],
      });
    }
  }

  function onCellMouseEnter(octaveIndex: number, index: number): void {
    activeMouseCellRef.current = {
      octaveIndex,
      index,
    };

    applyChangesLocal();
    forceUpdate();
  }

  function onCellMouseLeave(octaveIndex: number, index: number): void {
    if (
      activeMouseCellRef.current &&
      activeMouseCellRef.current.octaveIndex === octaveIndex &&
      activeMouseCellRef.current.index === index
    ) {
      activeMouseCellRef.current = undefined;
      applyChangesLocal();
      forceUpdate();
    }
  }

  function onClick() {
    safeInit();
    applyChangesLocal();
  }

  return (
    <div onClick={onClick}>
      <div
        className={styles.grid}
        style={
          {
            '--notes-count': notes.length,
          } as CSSProperties
        }
      >
        <div>Octave name\Level</div>
        {notes.map(({ name, en }, index) => (
          <div key={index} className={styles.columnName}>
            Level {index + 1}
            <br />
            {name}/{en}
          </div>
        ))}
        <div>Keyboard</div>
        {OCTAVES.map((octaveName, octaveIndex) => {
          const levelStart = START_FREQUENCY * 2 ** octaveIndex;

          const isHighLight = Math.floor(OCTAVES.length / octaveIndex) === 2;
          const className = cn(styles.octaveName, {
            [styles.highlight]: isHighLight,
          });

          return (
            <Fragment key={octaveName}>
              <div className={className}>{octaveName}</div>
              {notes.map(({ level }, index) => {
                // const step = levelStart / NOTES.length;
                // const frequency = levelStart + step * index;
                const frequency = levelStart * level;
                let plus = 0;

                if (settings.showStep) {
                  if (index > 0) {
                    plus = (level / notes[index - 1].level - 1) * 100;
                  } else if (octaveIndex > 0) {
                    plus =
                      (level / (notes[notes.length - 1].level / 2) - 1) * 100;
                  }
                }

                let isActive = false;

                const keyboardLayerType = keyboardBindings.get(octaveIndex);
                if (keyboardLayerType) {
                  isActive =
                    pressedKeys.get(keyboardLayerType)?.has(index) ?? false;
                }

                if (
                  !isActive &&
                  activeMouseCellRef.current &&
                  activeMouseCellRef.current.octaveIndex === octaveIndex &&
                  activeMouseCellRef.current.index === index
                ) {
                  isActive = true;
                }

                return (
                  <div
                    key={index}
                    className={cn(styles.cell, {
                      [styles.cell_active]: isActive,
                    })}
                    onMouseEnter={() => onCellMouseEnter(octaveIndex, index)}
                    onMouseLeave={() => onCellMouseLeave(octaveIndex, index)}
                  >
                    {settings.showNames && (
                      <>
                        {notes[index].en}
                        {octaveIndex}
                      </>
                    )}
                    {settings.showHertz && (
                      <>
                        {' '}
                        {frequency
                          .toFixed(frequency < 500 ? 1 : 0)
                          .replace(/\.0$/, '')}
                      </>
                    )}
                    {settings.showStep && plus && (
                      <>
                        {' '}
                        <span className={styles.step}>
                          (+{plus.toFixed(1)}%)
                        </span>
                      </>
                    )}
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
                  applyChangesLocal();
                  forceUpdate();
                  onKeyboardBindingsUpdated();
                }}
              />
            </Fragment>
          );
        })}
      </div>
      <SettingsPanel
        settings={settings}
        onUpdate={(updatedSettings) => {
          Object.assign(settings, updatedSettings);
          onSettingsUpdated();
          forceUpdate();
        }}
      />
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
      className={cn({
        [styles.select_active]: Boolean(value),
      })}
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

function applyChanges(
  { oscNodes }: AudioResults,
  notes: Note[],
  pressedKeys: PressedKeys,
  keyboardBindings: KeyboardBindings,
  activeCell: { octaveIndex: number; index: number } | undefined,
) {
  const activeFrequencies = new Set<number>();

  for (const [octaveIndex, keyboardLayerType] of keyboardBindings) {
    const layoutKeys = pressedKeys.get(keyboardLayerType);

    if (layoutKeys) {
      const levelStart = START_FREQUENCY * 2 ** octaveIndex;

      for (const noteIndex of layoutKeys) {
        const note = notes[noteIndex];

        if (note) {
          const frequency = levelStart * note.level;
          activeFrequencies.add(frequency);
        }
      }
    }
  }

  if (activeCell) {
    const levelStart = START_FREQUENCY * 2 ** activeCell.octaveIndex;
    const note = notes[activeCell.index];
    const frequency = levelStart * note.level;
    activeFrequencies.add(frequency);
  }

  syncOscNodes(oscNodes, activeFrequencies);
}

function syncOscNodes(
  nodes: OscNodeEntity[],
  activeFrequencies: Set<number>,
): void {
  const restFrequencies = new Set(activeFrequencies);

  for (const node of nodes) {
    const alreadyHas = restFrequencies.has(node.frequency);

    if (alreadyHas) {
      if (!node.isActive) {
        node.isActive = true;
        node.gain.gain.value = getVolumeBasedOnFrequency(node.frequency);
      }

      restFrequencies.delete(node.frequency);
    } else {
      if (node.isActive) {
        node.isActive = false;
        node.gain.gain.value = 0;
      }
    }
  }

  if (restFrequencies.size) {
    const vacantNodes = nodes.filter((node) => !node.isActive);

    for (const frequency of restFrequencies) {
      const node = vacantNodes.shift();

      if (!node) {
        console.warn(
          `Not enough nodes, all ${nodes.length} are already in use.`,
        );
        break;
      }

      node.frequency = frequency;
      node.osc.frequency.value = frequency;
      node.gain.gain.value = getVolumeBasedOnFrequency(frequency);
      node.isActive = true;
    }
  }
}

function getVolumeBasedOnFrequency(frequency: number) {
  return Math.min(1, (3 * 20) / frequency);
}
