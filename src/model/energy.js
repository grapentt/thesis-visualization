// A toy potential energy: every pair of atoms is joined by a harmonic spring.
// Because it only depends on distances, it is exactly invariant under
// translations and rotations of the whole molecule.

import { sub, length } from './vec3.js';

const atom = (X, i) => [X[3 * i], X[3 * i + 1], X[3 * i + 2]];
const distance = (X, i, j) => length(sub(atom(X, j), atom(X, i)));

/**
 * Springs between all pairs, at rest in configuration X0.
 * @param {number} count  number of atoms
 * @param {[number, number][]} bonds  stiff springs; all other pairs get the soft constant
 */
export function springNetwork(X0, count, bonds, { bond = 20, other = 0.4 } = {}) {
  const isBond = (i, j) => bonds.some(([a, b]) => (a === i && b === j) || (a === j && b === i));
  const springs = [];
  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      springs.push({ i, j, k: isBond(i, j) ? bond : other, rest: distance(X0, i, j) });
    }
  }
  return springs;
}

/** U(X) = Σ ½ k (d − d₀)², in eV when k is in eV/Å² and positions in Å. */
export const springEnergy = (X, springs) =>
  springs.reduce((sum, { i, j, k, rest }) => sum + 0.5 * k * (distance(X, i, j) - rest) ** 2, 0);
