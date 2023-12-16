import { useEffect, useRef } from 'react';

import styles from './Harmonics5.module.css';
import { draw } from './draw.ts';
import type { Harmonic } from './types.ts';
import {
  loadHarmonicsFromLocalStorage,
  persistHarmonicsToLocalStorage,
} from './persist.ts';
import {
  applyAudioSettings,
  experimentEffect,
  rampEffect,
  reversedRampEffect,
  setupAudio,
  SetupResults,
  smoothEffect,
  smoothFlatEffect,
  squareEffect,
  stopAudio,
  triangleEffect,
} from './audio.ts';
import { processHarmonics } from './processing.ts';
import { useLazyRef, useForceUpdate, useStateRef } from '../../hooks';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 250;

function getDefaultHarmonics() {
  return [
    { amplify: 1, shift: 0, index: 0 },
    ...Array.from({ length: 15 }, (_, index) => ({
      amplify: 0,
      shift: 0,
      index: index + 1,
    })),
  ];
}

export function Harmonics5() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContextRef = useRef<CanvasRenderingContext2D | undefined>();
  const [isPlayingRef, setIsPlaying] = useStateRef(() => false);

  const audioRef = useRef<SetupResults | undefined>();

  const harmonicsRef = useLazyRef<Harmonic[]>(
    () => loadHarmonicsFromLocalStorage() ?? getDefaultHarmonics(),
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

    const { values, maxLevel, avgLevel } = processHarmonics(
      harmonicsRef.current,
      CANVAS_WIDTH,
    );

    if (isPlayingRef.current && audioRef.current) {
      applyAudioSettings(audioRef.current, harmonicsRef.current, 1 / avgLevel);
    }

    draw(ctx, values, maxLevel);
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
        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => {
              if (!audioRef.current) {
                audioRef.current = setupAudio(harmonicsRef.current, 0);
              }
              setIsPlaying(true);
            }}
          >
            {isPlayingRef.current ? 'Playing' : 'Play'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (audioRef.current) {
                experimentEffect(audioRef.current.effectGain);
              }
            }}
          >
            Experiment
          </button>
          <button
            type="button"
            onClick={() => {
              if (audioRef.current) {
                smoothEffect(audioRef.current.effectGain);
              }
            }}
          >
            Smooth
          </button>
          <button
            type="button"
            onClick={() => {
              if (audioRef.current) {
                smoothFlatEffect(audioRef.current.effectGain);
              }
            }}
          >
            Smooth flat
          </button>
          <button
            type="button"
            onClick={() => {
              if (audioRef.current) {
                squareEffect(audioRef.current.effectGain);
              }
            }}
          >
            Square
          </button>
          <button
            type="button"
            onClick={() => {
              if (audioRef.current) {
                rampEffect(audioRef.current.effectGain);
              }
            }}
          >
            Ramp
          </button>
          <button
            type="button"
            onClick={() => {
              if (audioRef.current) {
                reversedRampEffect(audioRef.current.effectGain);
              }
            }}
          >
            Reversed ramp
          </button>
          <button
            type="button"
            onClick={() => {
              if (audioRef.current) {
                triangleEffect(audioRef.current.effectGain);
              }
            }}
          >
            Triangle
          </button>
          <hr />
          <button
            type="button"
            onClick={() => {
              harmonicsRef.current = getDefaultHarmonics();
              onHarmonicUpdate();
            }}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => {
              harmonicsRef.current = getDefaultHarmonics();
              for (let i = 0; i < 16; i += 2) {
                harmonicsRef.current[i].amplify = 1 / (i + 1);
              }
              onHarmonicUpdate();
            }}
          >
            Set Square
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
