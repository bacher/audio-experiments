import { Settings, WaveFormType } from './types.ts';
import styles from './SettingsPanel.module.css';

const SETTINGS = {
  showNames: 'Show names',
  showHertz: 'Show hertz',
  halfTones: 'Half tones',
  showStep: 'Show step',
} as const;

export function SettingsPanel({
  settings,
  onUpdate,
}: {
  settings: Settings;
  onUpdate: (settings: Settings) => void;
}) {
  return (
    <div className={styles.root}>
      {(Object.entries(SETTINGS) as [key: keyof typeof SETTINGS, string][]).map(
        ([key, name]) => (
          <label key={key} className={styles.settingsOption}>
            <input
              type="checkbox"
              checked={settings[key] ?? false}
              onChange={(event) => {
                onUpdate({
                  ...settings,
                  [key]: event.target.checked,
                });
              }}
            />{' '}
            {name}
          </label>
        ),
      )}
      <label>
        Waveform type:
        <select
          value={settings.waveFormType}
          onChange={(event) => {
            onUpdate({
              ...settings,
              waveFormType: event.target.value as WaveFormType,
            });
          }}
        >
          <option value="sine">Sine</option>
          <option value="square">Square</option>
          <option value="sawtooth">Sawtooth</option>
          <option value="triangle">Triangle</option>
        </select>
      </label>
    </div>
  );
}
