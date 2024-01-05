export function draw(
  ctx: CanvasRenderingContext2D,
  values: number[],
  maxValue: number,
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
