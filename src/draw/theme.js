// The visual identity in one place: colours, typefaces and reusable text styles.
// Scenes spread a style and override what they need:
//   text(ctx, 'label', x, y, { ...type.note, color: color.soft, align: 'center' })

export const color = Object.freeze({
  bg: '#0d1321',
  panel: '#141c2e',
  line: '#2c3a56',
  grid: '#1c2640',
  ink: '#ece8de',
  body: '#d3d7e0',
  muted: '#8a96ad',
  dim: '#56627a',
  // meaning-carrying colours
  soft: '#6cc4e8',
  stiff: '#ef8a5b',
  gold: '#f2cf63',
  x: '#ef6b6b',
  y: '#86d08f',
  z: '#7ea6f2',
});

/** Colour and name of the three spatial axes, indexed 0 … 2. */
export const axisColor = [color.x, color.y, color.z];
export const axisName = ['x', 'y', 'z'];

export const font = Object.freeze({
  display: '"Spectral", Georgia, serif',
  sans: '"IBM Plex Sans", system-ui, sans-serif',
  mono: '"IBM Plex Mono", ui-monospace, monospace',
});

export const type = Object.freeze({
  eyebrow: { font: font.mono, size: 17, weight: 500, color: color.muted, tracking: 2.5 },
  title: { font: font.display, size: 42, weight: 500, color: color.ink },
  display: { font: font.display, size: 30, weight: 500, color: color.ink },
  body: { font: font.sans, size: 22, color: color.body },
  note: { font: font.mono, size: 15, color: color.muted },
  label: { font: font.mono, size: 16, color: color.ink },
  math: { font: font.display, italic: true, size: 28, color: color.ink },
});

const FACES = [
  '400 24px "Spectral"', '500 24px "Spectral"', 'italic 400 24px "Spectral"', 'italic 500 24px "Spectral"',
  '400 20px "IBM Plex Sans"', '500 20px "IBM Plex Sans"',
  '400 20px "IBM Plex Mono"', '500 20px "IBM Plex Mono"', '600 20px "IBM Plex Mono"',
];

/** Canvas text only uses web fonts once they are loaded; resolves when they are (or failed). */
export function loadFonts() {
  if (!document.fonts?.load) return Promise.resolve();
  return Promise.all(FACES.map((f) => document.fonts.load(f).catch(() => {})));
}
