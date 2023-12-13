import { useEffect, useRef, useState } from 'react';

import { ControlShape, init } from './audio.ts';
import audioTrack from './outfoxing.mp3';
import styles from './Main.module.css';
import { RangeInput } from '../RangeInput/RangeInput.tsx';

const N = 100;

function drawWave(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  buffer: Uint8Array,
  n: number,
  secondColor: boolean,
  offsetRatio: number,
  bigN: number,
): void {
  const width = canvas.width / bigN;
  let x = n * width;

  ctx.fillStyle = secondColor ? 'rgb(200, 200, 200)' : 'rgb(230, 230, 230)';
  ctx.fillRect(x, 0, width, canvas.height);

  ctx.beginPath();
  ctx.moveTo(x, canvas.height / 2);
  ctx.lineTo(x, canvas.height);
  ctx.strokeStyle = 'rgba(255,0,0,0.2)';
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
    const barHeight = buffer[i] / 255;

    ctx.fillStyle = `rgb(${100 + barHeight * 128}, 50, 50)`;
    ctx.fillRect(x, canvas.height, barWidth, -barHeight * canvas.height);
    // Or centered:
    // const barHeight2 = barHeight * canvas.height;
    // ctx.fillRect(x, (canvas.height - barHeight2) / 2, barWidth, barHeight2);

    x += barWidth + 1;
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

export function Main() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [wide, setWide] = useState(false);
  const wideRef = useRef(wide);
  wideRef.current = wide;
  const controlsRef = useRef<ControlShape>();
  const initRef = useRef(false);
  const offsetRatioRef = useRef(0);
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
      const bigN = wideRef.current ? 1 : N;

      num += 1;

      if (num >= bigN) {
        // ctx.fillStyle = 'rgb(200, 200, 200)';
        // ctx.fillRect(0, 0, canvas.width, canvas.height);

        num = 0;
        secondColor = !secondColor;
      }

      if (bigN === 1) {
        secondColor = false;
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
        bigN,
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
        <RangeInput
          title="Balance"
          initialValue={0}
          min={-1}
          max={1}
          onChange={(value) => {
            if (controlsRef.current) {
              controlsRef.current.balanceParam.value = value;
            }
          }}
        />

        <RangeInput
          title="Volume"
          initialValue={0.5}
          onChange={(volume) => {
            if (controlsRef.current) {
              controlsRef.current.gainParam.value = volume;
            }
          }}
        />

        <RangeInput
          title="Offset ratio"
          initialValue={offsetRatioRef.current}
          onChange={(value) => {
            offsetRatioRef.current = value;
          }}
        />

        <RangeInput
          title="Frequency"
          initialValue={300}
          min={10}
          max={1000}
          step={1}
          onChange={(value) => {
            if (controlsRef.current?.oscRef.current) {
              controlsRef.current.oscRef.current.frequency.value = value;
            }
          }}
        />

        <label>
          <input
            type="checkbox"
            checked={wide}
            onChange={(event) => {
              setWide(event.target.checked);
            }}
          />
          Wide
        </label>

        <button
          type="button"
          data-playing="false"
          role="switch"
          aria-checked="false"
          onClick={async () => {
            if (!initRef.current) {
              initRef.current = true;
              controlsRef.current = await init(audioRef.current!);
              setPlayState(true);
            }

            setPlayState(!playState);
          }}
        >
          <span>Play/Pause</span>
        </button>
        <button
          type="button"
          onClick={() => {
            controlsRef.current!.playSweep();
          }}
        >
          Bam
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={1200}
        height={250}
        style={{ border: '1px solid #000' }}
      />
      <canvas
        ref={canvas2Ref}
        width={1200}
        height={150}
        style={{ border: '1px solid #000' }}
      />
    </div>
  );
}
