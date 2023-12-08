import { useEffect, useRef, useState } from 'react';

import { ControlShape, init } from './audio.ts';
import audioTrack from './outfoxing.mp3';
import styles from './App.module.css';

const N = 100;

function drawWave(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  buffer: Uint8Array,
  n: number,
  secondColor: boolean,
  offsetRatio: number,
): void {
  const width = canvas.width / N;
  let x = n * width;

  ctx.fillStyle = secondColor ? 'rgb(200, 200, 200)' : 'rgb(230, 230, 230)';
  ctx.fillRect(x, 0, width, canvas.height);

  ctx.beginPath();
  ctx.moveTo(x, canvas.height / 2);
  ctx.lineTo(x, canvas.height);
  ctx.strokeStyle = 'rgba(255,0,0,0.1)';
  ctx.stroke();

  ctx.beginPath();

  const bufferStart = Math.floor(offsetRatio * buffer.length);
  // const bufferStart = 0;
  const sliceWidth = width / (buffer.length - bufferStart - 1);

  for (let i = bufferStart; i < buffer.length; i += 1) {
    const v = buffer[i] / 128.0;
    const y = (v * canvas.height) / 2;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgb(0, 0, 0)';
  ctx.stroke();
}

function drawFreq(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  buffer: Uint8Array,
): void {
  ctx.fillStyle = 'rgb(0, 0, 0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const barWidth = (canvas.width - buffer.length) / buffer.length;
  let x = 0;

  for (let i = 0; i < buffer.length; i++) {
    const barHeight = (buffer[i] / 255 - 0.5) * 2; // [-1, 1]

    ctx.fillStyle = `rgb(${100 + Math.abs(barHeight) * 128}, 50, 50)`;
    // ctx.fillRect(x, canvas.height, barWidth, -barHeight * canvas.height);
    ctx.fillRect(
      x,
      0.5 * canvas.height,
      barWidth,
      -barHeight * (0.95 * 0.5 * canvas.height),
    );

    x += barWidth + 1;

    // const barHeight = buffer[i] / 2;
    //
    // ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
    // ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight);
    //
    // x += barWidth + 1;
  }
}

function drawXAxis(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
): void {
  ctx.beginPath();
  ctx.strokeStyle = 'rgb(30,30,30)';
  ctx.lineWidth = 1;
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();
}

export function App() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const controlsRef = useRef<ControlShape>();
  const initRef = useRef(false);
  const [volume, setVolume] = useState(1);
  const [balance, setBalance] = useState(0);
  const [offsetRatio, setOffsetRatio] = useState(0);
  const offsetRatioRef = useRef(offsetRatio);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvas2Ref = useRef<HTMLCanvasElement>(null);

  useEffect(
    () => () => {
      void controlsRef.current?.destroy();
      controlsRef.current = undefined;
    },
    [],
  );

  const [playState, setPlayState] = useState(false);

  useEffect(() => {
    if (controlsRef.current) {
      void controlsRef.current.toggle(playState);
    }
  }, [playState]);

  useEffect(() => {
    if (!playState) {
      return;
    }

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    const canvas2 = canvas2Ref.current!;
    const ctx2 = canvas2.getContext('2d')!;

    let lastRequestAnimationFrameId: number | undefined;

    let num = 0;
    let secondColor = false;

    function draw() {
      num += 1;

      if (num === N) {
        // ctx.fillStyle = 'rgb(200, 200, 200)';
        // ctx.fillRect(0, 0, canvas.width, canvas.height);

        num = 0;
        secondColor = !secondColor;
      }

      const ctl = controlsRef.current!;

      ctl.updateAnalyserData();
      drawWave(
        canvas,
        ctx,
        ctl.analyserBuffer,
        num,
        secondColor,
        offsetRatioRef.current,
      );

      drawFreq(canvas2, ctx2, ctl.freqAnalyserBuffer);

      drawXAxis(canvas, ctx);

      ctx.beginPath();

      lastRequestAnimationFrameId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      if (lastRequestAnimationFrameId) {
        cancelAnimationFrame(lastRequestAnimationFrameId);
      }
    };
  }, [playState]);

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

        <label>
          Offset ratio:
          <input
            type="range"
            id="volume"
            min="0"
            max="1"
            value={offsetRatio}
            step="0.01"
            onChange={(event) => {
              const newValue = Number(event.target.value);
              offsetRatioRef.current = newValue;
              setOffsetRatio(newValue);
            }}
          />
          <span>{offsetRatio}</span>
        </label>

        <button
          type="button"
          data-playing="false"
          role="switch"
          aria-checked="false"
          onClick={() => {
            if (!initRef.current) {
              initRef.current = true;
              controlsRef.current = init(audioRef.current!);
              setPlayState(true);
            }

            setPlayState(!playState);
          }}
        >
          <span>Play/Pause</span>
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={1200}
        height={300}
        style={{ border: '1px solid #000' }}
      />
      <canvas
        ref={canvas2Ref}
        width={1200}
        height={300}
        style={{ border: '1px solid #000' }}
      />
    </div>
  );
}
