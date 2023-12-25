import { Fragment, useRef } from 'react';
import cn from 'classnames';

import { useForceUpdate } from '../../hooks';
import styles from './Octaves2.module.css';
import { AudioResults, OscNodeEntity, setupAudio } from './audio.ts';
import { KeyboardLayerType } from './types.ts';
import { PressedKeys, usePressedKeys } from './usePressedKeys.ts';
import { usePersistMap } from '../../hooks/usePersistMap.ts';
import { usePersist } from '../../hooks/usePersist.ts';

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

export type KeyboardBindings = Map<number, KeyboardLayerType>;

export type Settings = {
  showHertz: boolean;
};

export function Octaves2() {
  const forceUpdate = useForceUpdate();

  const [keyboardBindings, onKeyboardBindingsUpdated] =
    usePersistMap<KeyboardBindings>('audio_keyboard_bindings');

  const [settings, onSettingsUpdated] = usePersist<Settings>({
    persistingKey: 'audio_settings',
    default: () => ({ showHertz: true }),
  });

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
      applyChanges(audioRef.current, pressedKeys, keyboardBindings);
    }
  }

  function safeInit() {
    if (!audioRef.current) {
      audioRef.current = setupAudio();
    }
  }

  return (
    <div>
      <div className={styles.grid} onClick={safeInit}>
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

                let isActive = false;

                const keyboardLayerType = keyboardBindings.get(octaveIndex);
                if (keyboardLayerType) {
                  isActive =
                    pressedKeys.get(keyboardLayerType)?.has(index) ?? false;
                }

                return (
                  <div
                    key={index}
                    className={cn({
                      [styles.cell_active]: isActive,
                    })}
                  >
                    {NOTES[index].en}
                    {octaveIndex}
                    {settings.showHertz
                      ? ` ${frequency
                          .toFixed(frequency < 500 ? 1 : 0)
                          .replace(/\.0$/, '')}`
                      : ''}
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
      <Settings
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

function Settings({
  settings,
  onUpdate,
}: {
  settings: Settings;
  onUpdate: (settings: Settings) => void;
}) {
  return (
    <div>
      <label className={styles.settingsOption}>
        <input
          type="checkbox"
          checked={settings.showHertz}
          onChange={(event) => {
            onUpdate({
              ...settings,
              showHertz: event.target.checked,
            });
          }}
        />{' '}
        Show hertz
      </label>
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
  pressedKeys: PressedKeys,
  keyboardBindings: KeyboardBindings,
) {
  const activeFrequencies = new Set<number>();

  for (const [octaveIndex, keyboardLayerType] of keyboardBindings) {
    const layoutKeys = pressedKeys.get(keyboardLayerType);

    if (layoutKeys) {
      const levelStart = START_FREQUENCY * 2 ** octaveIndex;

      for (const noteIndex of layoutKeys) {
        const note = NOTES[noteIndex];

        if (note) {
          const frequency = levelStart * note.level;
          activeFrequencies.add(frequency);
        }
      }
    }
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

      console.log('SET FREQ =', frequency);

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
