import * as THREE from 'three';

/** A point on a 2D profile: [radius, height along the axle], in metres. */
export type ProfilePoint = readonly [r: number, y: number];

/**
 * Spins a 2D profile around the Y axis to make a round part (a "lathe", like
 * turning metal on a lathe). Wheels, tyres and brake discs are all built this
 * way.
 *
 * Unlike THREE.LatheGeometry this can keep the corners of the profile sharp:
 * with `smooth: false` every profile segment becomes its own band with its own
 * normals, so machined steps catch the light as crisp edges. With
 * `smooth: true` normals are blended across the profile for rubber-like parts.
 *
 * The profile must run counter-clockwise when radius is drawn to the right and
 * height upward. In practice: outer surfaces go up, front faces go inward,
 * inner surfaces go down, back faces go outward.
 */
export function lathe(
  profile: readonly ProfilePoint[],
  { segments = 96, smooth = false }: { segments?: number; smooth?: boolean } = {},
): THREE.BufferGeometry {
  const bands = profile.length - 1;
  const ring = segments + 1;

  // One 2D normal per band, pointing to the right of the direction of travel.
  const bandNormals: Array<[number, number]> = [];
  for (let i = 0; i < bands; i++) {
    const dr = profile[i + 1][0] - profile[i][0];
    const dy = profile[i + 1][1] - profile[i][1];
    const len = Math.hypot(dr, dy) || 1;
    bandNormals.push([dy / len, -dr / len]);
  }

  const pointNormal = (band: number, end: 0 | 1): [number, number] => {
    if (!smooth) return bandNormals[band];
    const point = band + end;
    const a = bandNormals[Math.max(point - 1, 0)];
    const b = bandNormals[Math.min(point, bands - 1)];
    const nr = a[0] + b[0];
    const ny = a[1] + b[1];
    const len = Math.hypot(nr, ny) || 1;
    return [nr / len, ny / len];
  };

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  let lengthSoFar = 0;
  const totalLength = bandNormals.reduce(
    (sum, _, i) =>
      sum + Math.hypot(profile[i + 1][0] - profile[i][0], profile[i + 1][1] - profile[i][1]),
    0,
  );

  for (let band = 0; band < bands; band++) {
    const base = positions.length / 3;
    const bandLength = Math.hypot(
      profile[band + 1][0] - profile[band][0],
      profile[band + 1][1] - profile[band][1],
    );
    for (const end of [0, 1] as const) {
      const [r, y] = profile[band + end];
      const [nr, ny] = pointNormal(band, end);
      const v = (lengthSoFar + end * bandLength) / (totalLength || 1);
      for (let s = 0; s <= segments; s++) {
        const phi = (s / segments) * Math.PI * 2;
        const cos = Math.cos(phi);
        const sin = Math.sin(phi);
        positions.push(r * cos, y, r * sin);
        normals.push(nr * cos, ny, nr * sin);
        uvs.push(s / segments, v);
      }
    }
    lengthSoFar += bandLength;
    for (let s = 0; s < segments; s++) {
      const a0 = base + s;
      const a1 = base + s + 1;
      const b0 = base + ring + s;
      const b1 = base + ring + s + 1;
      indices.push(a0, b0, a1, b0, b1, a1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  return geometry;
}

/** Samples a smooth curve through 2D profile points. */
export function smoothProfile(points: readonly ProfilePoint[], samples: number): ProfilePoint[] {
  const curve = new THREE.CatmullRomCurve3(
    points.map(([r, y]) => new THREE.Vector3(r, y, 0)),
    false,
    'centripetal',
  );
  return curve.getPoints(samples).map((p) => [p.x, p.y] as const);
}
