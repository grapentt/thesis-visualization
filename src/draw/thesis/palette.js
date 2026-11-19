// The thesis programme's colours (programme.md §3.1). theme.js stays unchanged so Parts 0–1 render
// byte-identically; these add one meaning each. Gold is attention only.

import { color } from '../theme.js';

export const P = Object.freeze({
  ...color,
  bead: '#9aa7bd',
  stiff: '#ef8a5b', // bonds, stiff modes
  angle: '#f3b58d', // bond angles
  soft: '#6cc4e8', // torsions, soft modes
  mid: '#a3e6d4', // long-range distances, end-to-end, contacts
  global: '#5fd3b0', // size (Rg), loud modes a₁ a₂, slowest TIC
  wall: '#f497c0', // closest approach, the wall, overlaps
  info: '#c39bf5', // readability, meters, the "decided" ring
  gold: '#f2cf63', // attention only
  fog: '#aab8d6', // noise haze; never text or data
});

/** The warm-to-cool ramp of a feature's reach: stiff → angle → soft → mid → global. */
export const RAMP = [P.stiff, P.angle, P.soft, P.mid, P.global];
