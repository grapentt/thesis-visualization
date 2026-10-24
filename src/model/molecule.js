// The molecule shown throughout the video, and its two internal coordinates:
//   s  soft mode:  twist of H5 about bond 2–3 (arc length travelled by H5, Å)
//   q  stiff mode: stretch of bond 1–2 (change in bond length, Å)
// A configuration X is a flat array of 3N coordinates [x1, y1, z1, x2, …].

import { add, sub, scale, dot, cross, normalize, length, rotateAbout } from './vec3.js';

export const ELEMENTS = Object.freeze({
  C: { color: '#9aa7bd', radius: 0.3 },
  O: { color: '#e2655f', radius: 0.29 },
  N: { color: '#5f8ff0', radius: 0.29 },
  H: { color: '#e9e6dd', radius: 0.2 },
});

export class Molecule {
  /** @param {{ elements: string[], positions: number[], bonds: [number, number][] }} spec */
  constructor({ elements, positions, bonds }) {
    this.elements = elements;
    this.positions = Object.freeze([...positions]);
    this.bonds = bonds;
    this.count = elements.length;
    this.centroid = [0, 1, 2].map((k) => elements.reduce((sum, _, i) => sum + positions[3 * i + k], 0) / this.count);
  }

  atom(X, i) {
    return [X[3 * i], X[3 * i + 1], X[3 * i + 2]];
  }

  static setAtom(X, i, p) {
    X[3 * i] = p[0];
    X[3 * i + 1] = p[1];
    X[3 * i + 2] = p[2];
  }

  bondLength(X, i, j) {
    return length(sub(this.atom(X, j), this.atom(X, i)));
  }
}

/** 1 C, 2 C, 3 O, 4 N, 5 H (on the O). Positions in Å. */
export const molecule = new Molecule({
  elements: ['C', 'C', 'O', 'N', 'H'],
  positions: [-1.3, -0.2, 0.2, 0.1, 0.25, -0.1, 1.1, -0.65, 0.15, 0.35, 1.65, -0.35, 1.95, -0.25, 0.35],
  bonds: [[0, 1], [1, 2], [1, 3], [2, 4]],
});

const X0 = molecule.positions;
const twistAxis = normalize(sub(molecule.atom(X0, 2), molecule.atom(X0, 1)));
const hFromPivot = sub(molecule.atom(X0, 4), molecule.atom(X0, 1));
const twistRadius = length(sub(hFromPivot, scale(twistAxis, dot(hFromPivot, twistAxis))));

export const modes = Object.freeze({
  /** Direction H5 moves in when the twist starts (unit vector). */
  twistTangent: normalize(cross(twistAxis, hFromPivot)),
  /** Unit vector from atom 1 to atom 2. */
  stretchAxis: normalize(sub(molecule.atom(X0, 1), molecule.atom(X0, 0))),
});

/** Configuration with soft coordinate s and stiff coordinate q applied to `base`. */
export function configuration(s, q, base = X0) {
  const X = base.slice();
  Molecule.setAtom(X, 4, rotateAbout(molecule.atom(X, 4), molecule.atom(X, 1), twistAxis, s / twistRadius));
  for (let i = 0; i < molecule.count; i++) {
    const shift = scale(modes.stretchAxis, (i === 0 ? -0.5 : 0.5) * q);
    Molecule.setAtom(X, i, add(molecule.atom(X, i), shift));
  }
  return X;
}

/** Display colour of atom i of the video's molecule. */
export const atomColor = (i) => ELEMENTS[molecule.elements[i]].color;
