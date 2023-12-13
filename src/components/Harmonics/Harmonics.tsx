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

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 250;

function useStateRef<T>(initFunc: () => T): MutableRefObject<T> {
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

  const harmonicsRef = useStateRef<Harmonic[]>(
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

  const forceUpdate = useForceUpdate();

  function updateCanvas() {
    const ctx = canvasContextRef.current!;
    console.log('draw');
    draw(ctx, harmonicsRef.current);
  }

  useEffect(() => {
    canvasContextRef.current = canvasRef.current!.getContext('2d', {
      willReadFrequently: false,
    })!;
    updateCanvas();
  }, []);

  function onHarmonicUpdate() {
    forceUpdate();
    updateCanvas();
    // TODO: Make lazy
    persistHarmonicsToLocalStorage(harmonicsRef.current);
  }

  return (
    <div className={styles.root}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
      />
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
