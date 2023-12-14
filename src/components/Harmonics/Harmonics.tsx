import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import styles from './Harmonics.module.css';
import { draw } from './draw.ts';
import type { Harmonic } from './types.ts';
import {
  loadHarmonicsFromLocalStorage,
  persistHarmonicsToLocalStorage,
} from './persist.ts';
import { playAudio, stopAudio } from './audio.ts';
import { processHarmonics } from './processing.ts';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 250;

function useStateRef<T>(
  initFunc: () => T,
): [MutableRefObject<T>, (value: T) => void] {
  const [value, setValue] = useState(initFunc);
  const ref = useRef(value);

  return [
    ref,
    (updatedValue) => {
      ref.current = updatedValue;
      setValue(updatedValue);
    },
  ];
}

function useLazyRef<T>(initFunc: () => T): MutableRefObject<T> {
  const [initialValue] = useState(initFunc);
  return useRef(initialValue);
}

function useForceUpdate() {
  const [, setState] = useState(0);

  return useCallback(() => {
    setState((state) => state + 1);
  }, []);
}

export function Harmonics() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContextRef = useRef<CanvasRenderingContext2D | undefined>();
  const [isPlayingRef, setIsPlaying] = useStateRef(() => false);

  const harmonicsRef = useLazyRef<Harmonic[]>(
    () =>
      loadHarmonicsFromLocalStorage() ?? [
        { amplify: 1, shift: 0, index: 0 },
        ...Array.from({ length: 15 }, (_, index) => ({
          amplify: 0,
          shift: 0,
          index: index + 1,
        })),
      ],
  );

  useEffect(() => {
    if (isPlayingRef.current) {
      updateCanvas();
    } else {
      void stopAudio();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlayingRef.current]);

  const forceUpdate = useForceUpdate();

  function updateCanvas() {
    const ctx = canvasContextRef.current!;

    const { values, maxValue, area } = processHarmonics(
      harmonicsRef.current,
      CANVAS_WIDTH,
    );

    if (isPlayingRef.current) {
      void playAudio(harmonicsRef.current, area);
    }

    draw(ctx, values, maxValue);
  }

  useEffect(() => {
    canvasContextRef.current = canvasRef.current!.getContext('2d', {
      willReadFrequently: false,
    })!;
    updateCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onHarmonicUpdate() {
    forceUpdate();

    updateCanvas();

    window.setTimeout(() => {
      persistHarmonicsToLocalStorage(harmonicsRef.current);
    }, 50);
  }

  return (
    <div className={styles.root}>
      <div className={styles.topPanel}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
        />
        <div>
          <button
            type="button"
            onClick={() => {
              setIsPlaying(!isPlayingRef.current);
            }}
          >
            {isPlayingRef.current ? 'Stop' : 'Play'}
          </button>
        </div>
      </div>
      <div className={styles.harmonics}>
        {harmonicsRef.current.map((harmonic, i) => (
          <div key={i} className={styles.ranges}>
            <span className={styles.counter}>#{i + 1}</span>
            <input
              type="range"
              className={styles.rangeInput}
              min={0}
              max={1}
              step={0.01}
              value={harmonic.amplify}
              onChange={(event) => {
                harmonic.amplify = Number(event.target.value);
                onHarmonicUpdate();
              }}
            />
            <input
              type="range"
              className={styles.rangeInput}
              min={0}
              max={1}
              step={0.01}
              value={harmonic.shift}
              onChange={(event) => {
                harmonic.shift = Number(event.target.value);
                onHarmonicUpdate();
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
