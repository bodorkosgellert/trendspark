/**
 * React Native-parseable mirrors of the global.css tokens.
 *
 * Uniwind resolves theme tokens for className styling, but native colour props
 * (SVG paint, navigation tints, status bar, gradients) must receive values React
 * Native can parse, so oklch() cannot be passed through. Keep these in sync with
 * the dark variant in global.css.
 */
export const palette = {
  canvas: '#0D0E12',
  background: '#121319',
  panel: '#17181E',
  panelRaised: '#1F2027',
  surface: '#1A1B21',
  border: '#2C2D35',
  grid: '#272830',
  foreground: '#F5F5F7',
  muted: '#9C9DA6',
  inkDim: '#75767F',
  accent: '#A9EF4B',
  accentInk: '#1B2612',
  hot: '#FBB03B',
  down: '#F65C4E',
} as const;

export type PaletteKey = keyof typeof palette;
