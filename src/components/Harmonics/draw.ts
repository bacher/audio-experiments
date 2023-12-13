import { Harmonic } from './types.ts';

export function draw(
  ctx: CanvasRenderingContext2D,
  harmonics: Harmonic[],
): void {
  const { width: CANVAS_WIDTH, height: CANVAS_HEIGHT } = ctx.canvas;

  ctx.save();

  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.translate(0, CANVAS_HEIGHT / 2);

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(CANVAS_WIDTH, 0);
  ctx.strokeStyle = '#000';
  ctx.stroke();

  const values = Array.from({ length: CANVAS_WIDTH }, () => 0);

  // const scale = CANVAS_HEIGHT / 2;

  let maxValue = 0;

  for (let x = 0; x <= CANVAS_WIDTH; x += 1) {
    const rad = (x / CANVAS_WIDTH) * 2 * Math.PI;
    let value = 0;

    for (const harmonic of harmonics) {
      if (harmonic.amplify !== 0) {
        const m = harmonic.index + 1;
        value +=
          harmonic.amplify * Math.sin(m * rad + harmonic.shift * 2 * Math.PI);
      }
    }

    values[x] = value;

    if (Math.abs(value) >= maxValue) {
      maxValue = Math.abs(value);
    }
  }

  const scale = 0.9 * (CANVAS_HEIGHT / 2 / maxValue);

  ctx.beginPath();

  const maxLevel = Math.floor(CANVAS_HEIGHT / scale);
  for (let i = 1; i <= maxLevel; i += 1) {
    const scaledValue = i * scale;

    ctx.moveTo(0, scaledValue);
    ctx.lineTo(CANVAS_WIDTH, scaledValue);
    ctx.moveTo(0, -scaledValue);
    ctx.lineTo(CANVAS_WIDTH, -scaledValue);
  }
  ctx.strokeStyle = '#ddd';
  ctx.stroke();

  ctx.beginPath();

  for (let x = 0; x <= CANVAS_WIDTH; x += 1) {
    const value = values[x];
    const scaledValue = value * scale;

    if (x === 0) {
      ctx.moveTo(x, scaledValue);
    } else {
      ctx.lineTo(x, scaledValue);
    }
  }

  ctx.strokeStyle = '#333';
  ctx.stroke();

  ctx.beginPath();

  ctx.restore();
}
