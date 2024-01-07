export function draw(
  ctx: CanvasRenderingContext2D,
  radialValues: (number | undefined)[],
): void {
  const { width, height } = ctx.canvas;

  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, width, height);

  ctx.save();

  ctx.translate(width / 2, height / 2);
  const scale = Math.min(width, height) / 2;
  ctx.scale(scale, scale);

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
}
