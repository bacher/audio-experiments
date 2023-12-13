import { useState } from 'react';

import styles from './RangeInput.module.css';

type Props = {
  title: string;
  min?: number;
  max?: number;
  step?: number;
  initialValue: number;
  onChange: (value: number) => void;
};

export function RangeInput({
  title,
  initialValue,
  min = 0,
  max = 1,
  step = 0.01,
  onChange,
}: Props) {
  const [value, setValue] = useState(initialValue);

  return (
    <label className={styles.root}>
      <span className={styles.title}>{title}:</span>
      <input
        className={styles.input}
        type="range"
        id="volume"
        min={min}
        max={max}
        value={value}
        step={step}
        onChange={(event) => {
          const newValue = Number(event.target.value);
          setValue(newValue);
          onChange(newValue);
        }}
      />
      <span className={styles.value}>{value.toFixed(3)}</span>
    </label>
  );
}
