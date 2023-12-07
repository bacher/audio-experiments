import { useEffect, useRef, useState } from 'react';

import { ControlShape, init } from './audio.ts';
import audioTrack from './outfoxing.mp3';
import styles from './App.module.css';

export function App() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const controlsRef = useRef<ControlShape>();
  const initRef = useRef(false);
  const [volume, setVolume] = useState(1);
  const [balance, setBalance] = useState(0);

  useEffect(
    () => () => {
      void controlsRef.current?.destroy();
      controlsRef.current = undefined;
    },
    [],
  );

  return (
    <div>
      <audio
        ref={audioRef}
        src={audioTrack}
        onEnded={() => {
          console.log('done');
        }}
      />
      <div className={styles.controls}>
        <label>
          Balance:
          <input
            type="range"
            id="panner"
            min="-1"
            max="1"
            value={balance}
            step="0.01"
            onChange={(event) => {
              const newValue = Number(event.target.value);
              setBalance(newValue);

              if (controlsRef.current) {
                controlsRef.current.balanceParam.value = newValue;
              }
            }}
          />
        </label>

        <label>
          Volume:
          <input
            type="range"
            id="volume"
            min="0"
            max="2"
            value={volume}
            step="0.01"
            onChange={(event) => {
              const newValue = Number(event.target.value);
              setVolume(newValue);

              if (controlsRef.current) {
                controlsRef.current.gainParam.value = newValue;
              }
            }}
          />
        </label>
        <button
          type="button"
          data-playing="false"
          role="switch"
          aria-checked="false"
          onClick={async () => {
            if (!initRef.current) {
              initRef.current = true;
              controlsRef.current = init(audioRef.current!);
            }

            await controlsRef.current!.play();
          }}
        >
          <span>Play/Pause</span>
        </button>
      </div>
    </div>
  );
}
