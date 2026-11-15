// Prepares the Porsche 911 Carrera 4S model for the garage, without Blender.
//
// Source: "(FREE) Porsche 911 Carrera 4S" by Karol Miklas, CC-BY-SA-4.0,
// https://sketchfab.com/3d-models/free-porsche-911-carrera-4s-d01b254483794de3819786d93e0e1ebf
// mirrored in the HoanghoDev/3dmodel GitHub repository.
//
// What it does:
//   1. Downloads the source GLB if it is not cached in assets-src/.
//   2. Rotates the model 180° so the nose points to -z (our convention) and
//      lifts it so the tyres rest on y = 0.
//   3. Deletes the baked wheel/brake meshes and the baked ground shadow, and
//      adds empty mount nodes where the wheel centres were.
//   4. Re-compresses with Meshopt.
//
// Run with: node scripts/prepare-porsche.mjs

import { existsSync } from 'node:fs';
import { mkdir, writeFile, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, getBounds, meshopt, prune } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const SOURCE_URL =
  'https://raw.githubusercontent.com/HoanghoDev/3dmodel/main/model/free_porsche_911_carrera_4s.glb';
const SOURCE_PATH = resolve(root, 'assets-src/porsche-911-carrera-4s.glb');
const OUTPUT_PATH = resolve(root, 'public/models/porsche-911-carrera-4s.glb');

// Measured from the source file: the wheel pair meshes sit at these centres.
// Front wheels are the steered pair at +z in the source; after the 180° turn
// the nose points to -z. Tyres rest on y = 0 after lifting by GROUND_LIFT.
const GROUND_LIFT = 0.637;
const AXLE_Y = 0.333;
const FRONT_Z = -1.274;
const REAR_Z = 1.167;
// Half tracks from the real 992 Carrera 4S spec sheet (1589 / 1557 mm tracks).
const FRONT_HALF_TRACK = 0.795;
const REAR_HALF_TRACK = 0.779;

// Subtrees to remove: the two wheel-pair nodes (rims, tyres, brake discs) and
// the baked ground shadow plane.
const DELETE = ['Cylinder.000', 'Cylinder.001', 'Plane'];

async function download() {
  if (existsSync(SOURCE_PATH)) return;
  console.log('Downloading source model…');
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  await mkdir(dirname(SOURCE_PATH), { recursive: true });
  await writeFile(SOURCE_PATH, Buffer.from(await res.arrayBuffer()));
}

function disposeTree(node) {
  for (const child of node.listChildren()) disposeTree(child);
  node.dispose();
}

/** Hamilton product a ⊗ b for [x, y, z, w] quaternions. */
function quatMultiply(a, b) {
  const [ax, ay, az, aw] = a;
  const [bx, by, bz, bw] = b;
  return [
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
    aw * bw - ax * bx - ay * by - az * bz,
  ];
}

await download();

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'draco3d.decoder': await draco3d.createDecoderModule(),
  'meshopt.decoder': MeshoptDecoder,
  'meshopt.encoder': MeshoptEncoder,
});

const doc = await io.read(SOURCE_PATH);
const docRoot = doc.getRoot();
const scene = docRoot.getDefaultScene();

docRoot
  .listExtensionsUsed()
  .find((ext) => ext.extensionName === 'KHR_draco_mesh_compression')
  ?.dispose();

// --- Reorient: nose to -z, tyres on the ground ------------------------------
const Y_180 = [0, 1, 0, 0];
for (const child of scene.listChildren()) {
  const [tx, ty, tz] = child.getTranslation();
  child.setRotation(quatMultiply(Y_180, child.getRotation()));
  child.setTranslation([-tx, ty + GROUND_LIFT, -tz]);
}

// --- Wheels and shadow out, mounts in ---------------------------------------
const byName = (name) => {
  const node = docRoot.listNodes().find((n) => n.getName() === name);
  if (!node) throw new Error(`Node "${name}" not found`);
  return node;
};
for (const name of DELETE) disposeTree(byName(name));

const MOUNTS = {
  mount_wheel_fl: [-FRONT_HALF_TRACK, AXLE_Y, FRONT_Z],
  mount_wheel_fr: [FRONT_HALF_TRACK, AXLE_Y, FRONT_Z],
  mount_wheel_rl: [-REAR_HALF_TRACK, AXLE_Y, REAR_Z],
  mount_wheel_rr: [REAR_HALF_TRACK, AXLE_Y, REAR_Z],
};
for (const [name, position] of Object.entries(MOUNTS)) {
  scene.addChild(doc.createNode(name).setTranslation(position));
}

// --- Clean up and compress --------------------------------------------------
await doc.transform(
  prune({ keepLeaves: true }),
  dedup(),
  meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
);

await mkdir(dirname(OUTPUT_PATH), { recursive: true });
await io.write(OUTPUT_PATH, doc);

const { min, max } = getBounds(scene);
const mm = (m) => Math.round(m * 1000);
console.log(`Bounds: ${mm(max[0] - min[0])} x ${mm(max[1] - min[1])} x ${mm(max[2] - min[2])} mm, floor y ${mm(min[1])} mm`);
console.log(`Wrote ${OUTPUT_PATH} (${((await stat(OUTPUT_PATH)).size / 1e6).toFixed(2)} MB)`);
