import { useEffect, useRef } from 'react';

import { useLazyRef, useForceUpdate } from '../../hooks';
import styles from './FourierTransform.module.css';
import { draw } from './draw.ts';
import type { Harmonic } from './types.ts';
import {
  loadHarmonicsFromLocalStorage,
  persistHarmonicsToLocalStorage,
} from './persist.ts';
import { processHarmonics } from './processing.ts';
import { FourierGraph } from './FourierGraph';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 250;

export function FourierTransform() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContextRef = useRef<CanvasRenderingContext2D | undefined>();

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

  const signalRef = useRef<number[] | undefined>();

  const forceUpdate = useForceUpdate();

  function updateCanvas() {
    const ctx = canvasContextRef.current!;

    const { values, maxValue } = processHarmonics(
      harmonicsRef.current,
      CANVAS_WIDTH,
    );

    signalRef.current = values;
    draw(ctx, values, maxValue);
    forceUpdate();
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
      <div className={styles.leftPanel}>
        <div className={styles.topPanel}>
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
          />
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
      <div>
        {signalRef.current && <FourierGraph signal={signalRef.current} />}
      </div>
    </div>
  );
}
