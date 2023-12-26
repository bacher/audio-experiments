import { Settings } from './types.ts';
import styles from './SettingsPanel.module.css';

const SETTINGS = {
  showNames: 'Show names',
  showHertz: 'Show hertz',
  halfTones: 'Half tones',
  showStep: 'Show step',
};

export function SettingsPanel({
  settings,
  onUpdate,
}: {
  settings: Settings;
  onUpdate: (settings: Settings) => void;
}) {
  return (
    <div>
      {(Object.entries(SETTINGS) as [key: keyof Settings, string][]).map(
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
    </div>
  );
}
