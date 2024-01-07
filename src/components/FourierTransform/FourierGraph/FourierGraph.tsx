import { useEffect, useMemo, useRef } from 'react';

import { usePersistState } from '../../../hooks/usePersistState.ts';

import styles from './FourierGraph.module.css';
import { draw } from './draw.ts';
import { signalToRadial } from './logic.ts';

const CANVAS_SIZE = 400;
const DISCRETIZATION = 500;

type Props = {
  signal: number[];
};

export function FourierGraph({ signal }: Props) {
  const fourierCanvasRef = useRef<HTMLCanvasElement>(null);

  const [stepOrder, setStepOrder] = usePersistState({
    persistingKey: 'audio_fourier_step_order',
    default: () => 1,
  });

  const radialValues = useMemo(
    () => signalToRadial({ signal, stepOrder, discretization: DISCRETIZATION }),
    [stepOrder, signal],
  );

  useEffect(() => {
    const ctx = fourierCanvasRef.current!.getContext('2d', {
      willReadFrequently: false,
      alpha: false,
    })!;

    draw(ctx, radialValues);
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
