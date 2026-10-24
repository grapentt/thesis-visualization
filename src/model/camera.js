// A simple perspective camera: rotate (yaw about y, then pitch about x),
// project with focal length `focal`, place at (cx, cy) with `scale` px per unit.

const DEFAULTS = { yaw: 0.5, pitch: 0.28, scale: 160, cx: 800, cy: 520, focal: 10, center: [0, 0, 0] };

/**
 * @returns {{ project(p: number[]): { x: number, y: number, z: number, k: number },
 *             rotate(v: number[]): number[], scale: number }}
 *   project: screen position, depth z (larger = farther) and perspective factor k.
 *   rotate:  a direction in view coordinates (z points away from the viewer), e.g. to
 *            test whether a surface normal faces the camera (rotate(n)[2] < 0).
 */
export function camera(options = {}) {
  const v = { ...DEFAULTS, ...options };
  const cy = Math.cos(v.yaw);
  const sy = Math.sin(v.yaw);
  const cp = Math.cos(v.pitch);
  const sp = Math.sin(v.pitch);

  const rotate = (p) => {
    const x = p[0] * cy + p[2] * sy;
    const z = -p[0] * sy + p[2] * cy;
    return [x, p[1] * cp - z * sp, p[1] * sp + z * cp];
  };

  return {
    ...v,
    rotate,
    project(p) {
      const [x, y2, z2] = rotate([p[0] - v.center[0], p[1] - v.center[1], p[2] - v.center[2]]);
      const k = v.focal / (v.focal + z2);
      return { x: v.cx + x * v.scale * k, y: v.cy - y2 * v.scale * k, z: z2, k };
    },
  };
}
