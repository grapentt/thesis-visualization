import { color } from './theme.js';

/** Solid stage colour with faint graph-paper dots. Returns a painter for the timeline. */
export function dotGridBackground(width, height, spacing = 40) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const g = canvas.getContext('2d');
  g.fillStyle = color.bg;
  g.fillRect(0, 0, width, height);
  g.fillStyle = 'rgba(138,150,173,0.07)';
  for (let y = spacing / 2; y < height; y += spacing) {
    for (let x = spacing / 2; x < width; x += spacing) {
      g.beginPath();
      g.arc(x, y, 1.2, 0, Math.PI * 2);
      g.fill();
    }
  }
  return (ctx) => ctx.drawImage(canvas, 0, 0);
}
