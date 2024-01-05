import { useEffect, useMemo, useRef } from 'react';

import styles from './FourierGraph.module.css';
import { usePersist2 } from '../../hooks/usePersist2.ts';

const CANVAS_SIZE = 400;
const DISCRETIZATION = 500;

type Props = {
  signal: number[];
};

function lookup(values: number[], index: number): number {
  const nearDown = Math.floor(index);
  const nearUp = Math.ceil(index);

  if (nearDown >= values.length) {
    throw new Error();
  }

  if (nearUp >= values.length) {
    return values[values.length - 1];
  }

  const down = values[nearDown];
  const up = values[nearUp];

  const fract = index % 1;

  const out = (1 - fract) * down + fract * up;

  if (Number.isNaN(out)) {
    throw new Error();
  }

  return out;
}

function normalizeArray(array: (number | undefined)[]): void {
  let max = 0;

  for (const current of array) {
    if (current !== undefined) {
      const absCurrent = Math.abs(current);
      if (absCurrent > max) {
        max = absCurrent;
      }
    }
  }

  if (max !== 0) {
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < array.length; i += 1) {
      if (array[i] !== undefined) {
        array[i]! /= max;
      }
    }
  }
}

export function FourierGraph({ signal }: Props) {
  const fourierCanvasRef = useRef<HTMLCanvasElement>(null);

  const [stepOrder, setStepOrder] = usePersist2({
    persistingKey: 'audio_fourier_step_order',
    default: () => 1,
  });

  const radialValues = useMemo(() => {
    const values: (number | undefined)[] = Array.from(
      { length: DISCRETIZATION },
      () => undefined,
    );

    const cycle = 1 - stepOrder;

    const iteration = (signal.length * cycle) / DISCRETIZATION / 10;

    for (let i = 0; i <= signal.length - 1; i += iteration) {
      const placeOnCycle = ((i / signal.length) % cycle) / cycle;

      const signalValue = lookup(signal, i);

      const index = Math.floor(placeOnCycle * values.length);

      if (values[index] === undefined) {
        values[index] = 0;
      }

      values[index]! += signalValue;
    }

    normalizeArray(values);

    return values;
  }, [stepOrder, signal]);

  useEffect(() => {
    const ctx = fourierCanvasRef.current!.getContext('2d', {
      willReadFrequently: false,
      alpha: false,
    })!;

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    ctx.save();

    ctx.translate(CANVAS_SIZE / 2, CANVAS_SIZE / 2);
    ctx.scale(CANVAS_SIZE / 2, CANVAS_SIZE / 2);

    ctx.arc(0, 0, 0.01, 0, 2 * Math.PI);
    ctx.fillStyle = '#000';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, 0.5, 0, 2 * Math.PI);
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 0.005;
    ctx.stroke();

    const badSectors = [];

    ctx.beginPath();

    for (let i = 0; i < radialValues.length; i += 1) {
      const value = radialValues[i];
      const ratio = i / radialValues.length;

      ctx.save();
      ctx.rotate(ratio * 2 * Math.PI);

      if (value === undefined) {
        badSectors.push(ratio * 2 * Math.PI);
      }

      if (value !== undefined) {
        const x = (1 + value / 1.5) / 2;

        if (i === 0) {
          ctx.moveTo(x, 0);
        } else {
          ctx.lineTo(x, 0);
        }
      }

      ctx.restore();
    }

    ctx.closePath();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 0.01;
    ctx.stroke();

    ctx.beginPath();

    if (badSectors.length) {
      for (const rotation of badSectors) {
        ctx.save();
        ctx.rotate(rotation);
        ctx.beginPath();
        ctx.arc(0.5, 0, 0.02, 0, 2 * Math.PI);
        ctx.fillStyle = '#f00';
        ctx.fill();
        ctx.restore();
      }
    }

    ctx.beginPath();

    ctx.restore();
  }, [radialValues]);

  return (
    <div>
      <div>
        <div>
          <input
            className={styles.stepRangeInput}
            type="range"
            min="0"
            step="0.001"
            max="0.98"
            value={stepOrder}
            onChange={(event) => {
              setStepOrder(Number(event.target.value));
            }}
          />
          <span>{(1 - stepOrder).toFixed(3)}</span>
        </div>
        <div>
          <button
            type="button"
            onClick={() => {
              setStepOrder(Math.max(0, stepOrder - 0.01));
            }}
          >
            -
          </button>
          <button
            type="button"
            onClick={() => {
              setStepOrder(Math.min(1, stepOrder + 0.01));
            }}
          >
            +
          </button>
        </div>
      </div>
      <canvas ref={fourierCanvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} />
    </div>
  );
}
