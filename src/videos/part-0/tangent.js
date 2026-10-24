// Tangent vectors of the molecule: symmetry generators (vertical) and shape
// changes (horizontal), drawn as one arrow per atom.

import { molecule, arrow3, vec3 } from '../../kit.js';
import { generators, shapeAB, flatten, VERTICAL, HORIZONTAL } from './shared.js';

const X0 = molecule.positions;

/** Rescale so the longest arrow is `longest` Å. */
function normalised(vectors, longest = 0.9) {
  const max = Math.max(...vectors.map((v) => vec3.length(v)));
  return vectors.map((v) => vec3.scale(v, longest / max));
}

export const MOLECULE_TANGENTS = [
  { label: 'translation along x', kind: 'vertical', vectors: normalised(generators.translation(X0, [1, 0, 0]), 0.7) },
  { label: 'translation along y', kind: 'vertical', vectors: normalised(generators.translation(X0, [0, 1, 0]), 0.7) },
  { label: 'rotation about the z-axis', kind: 'vertical', vectors: normalised(generators.rotation(X0, [0, 0, 1])) },
  { label: 'rotation about the y-axis', kind: 'vertical', vectors: normalised(generators.rotation(X0, [0, 1, 0])) },
  { label: 'shape change: twist of O–H about bond 1–2', kind: 'horizontal', vectors: normalised(generators.shape((e) => flatten(shapeAB(e, 0)))) },
  { label: 'shape change: bend of atom 4', kind: 'horizontal', vectors: normalised(generators.shape((e) => flatten(shapeAB(0, e)))) },
];

export const tangentColor = (kind) => (kind === 'vertical' ? VERTICAL : HORIZONTAL);

/** X moved a little along the tangent vectors (linearised motion). */
export const displaced = (X, vectors, amount) => X.map((x, j) => x + amount * vectors[Math.floor(j / 3)][j % 3]);

/** One arrow per atom, starting at the atoms of X. */
export function drawAtomArrows(ctx, cam, X, vectors, { color, alpha = 1, scale = 1 }) {
  vectors.forEach((v, i) => {
    if (vec3.length(v) * scale < 0.05) return;
    arrow3(ctx, cam, molecule.atom(X, i), vec3.scale(v, scale), { color, width: 4, head: 13, alpha });
  });
}

