// Prepares the source car model for the garage, without Blender.
//
// What it does (all with glTF Transform):
//   1. Downloads the source GLB if it is not cached in assets-src/.
//   2. Turns the four stock wheel nodes into empty "mount" nodes. A mount is an
//      attachment point: a node with a position but no mesh. The app reads the
//      mounts at runtime and snaps procedural wheels and brakes onto them.
//   3. Deletes the stock wheel/tyre/brake meshes (we generate our own in code).
//   4. Renames the meshes we drive from code so their names say what they are.
//   5. Re-compresses the file with Meshopt, which three.js can decode without
//      fetching an external decoder.
//
// Run with: npm run prepare:car

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
  'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/ferrari.glb';
const SOURCE_PATH = resolve(root, 'assets-src/ferrari-458-italia.glb');
const OUTPUT_PATH = resolve(root, 'public/models/ferrari-458-spider.glb');

/** Source node name -> name used by the app (see src/data/cars.ts). */
const RENAME = {
  body: 'body_paint',
  glass: 'glass',
  leather: 'interior_leather',
  trim: 'interior_accent',
  carpet: 'interior_carpet',
  steering_leather: 'steering_leather',
  steering_trim: 'steering_accent',
};

/** Source wheel node -> mount node. */
const WHEELS = {
  wheel_fl: 'mount_wheel_fl',
  wheel_fr: 'mount_wheel_fr',
  wheel_rl: 'mount_wheel_rl',
  wheel_rr: 'mount_wheel_rr',
};

async function download() {
  if (existsSync(SOURCE_PATH)) return;
  console.log(`Downloading ${SOURCE_URL}`);
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`);
  await mkdir(dirname(SOURCE_PATH), { recursive: true });
  await writeFile(SOURCE_PATH, Buffer.from(await res.arrayBuffer()));
}

function disposeTree(node) {
  for (const child of node.listChildren()) disposeTree(child);
  node.dispose();
}

await download();
await MeshoptDecoder.ready;
await MeshoptEncoder.ready;

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'draco3d.decoder': await draco3d.createDecoderModule(),
  'meshopt.decoder': MeshoptDecoder,
  'meshopt.encoder': MeshoptEncoder,
});

const doc = await io.read(SOURCE_PATH);
const gltfRoot = doc.getRoot();
const scene = gltfRoot.listScenes()[0];
const nodes = gltfRoot.listNodes();
const byName = (name) => nodes.find((n) => n.getName() === name);

// The source is Draco-compressed. Dropping the extension stores plain geometry,
// which Meshopt then compresses below.
gltfRoot
  .listExtensionsUsed()
  .find((ext) => ext.extensionName === 'KHR_draco_mesh_compression')
  ?.dispose();

// --- Wheels -> mounts ------------------------------------------------------
// The model is slightly asymmetric left to right, so average both sides.
const pos = Object.fromEntries(
  Object.keys(WHEELS).map((name) => {
    const node = byName(name);
    if (!node) throw new Error(`Missing wheel node "${name}"`);
    return [name, node.getWorldTranslation()];
  }),
);
const axle = (left, right) => ({
  halfTrack: (Math.abs(pos[left][0]) + Math.abs(pos[right][0])) / 2,
  y: (pos[left][1] + pos[right][1]) / 2,
  z: (pos[left][2] + pos[right][2]) / 2,
});
const front = axle('wheel_fl', 'wheel_fr');
const rear = axle('wheel_rl', 'wheel_rr');
const mountPos = {
  mount_wheel_fl: [-front.halfTrack, front.y, front.z],
  mount_wheel_fr: [front.halfTrack, front.y, front.z],
  mount_wheel_rl: [-rear.halfTrack, rear.y, rear.z],
  mount_wheel_rr: [rear.halfTrack, rear.y, rear.z],
};

for (const [wheelName, mountName] of Object.entries(WHEELS)) {
  disposeTree(byName(wheelName));
  const mount = doc.createNode(mountName).setTranslation(mountPos[mountName]);
  scene.addChild(mount);
}

// --- Renames ---------------------------------------------------------------
for (const [from, to] of Object.entries(RENAME)) {
  const node = byName(from);
  if (!node) throw new Error(`Missing node "${from}"`);
  node.setName(to);
  node.getMesh()?.setName(to);
}

// --- Clean up and compress -------------------------------------------------
// keepLeaves stops prune() from deleting the mounts, which are empty on purpose.
await doc.transform(
  prune({ keepLeaves: true }),
  dedup(),
  meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
);

await mkdir(dirname(OUTPUT_PATH), { recursive: true });
await io.write(OUTPUT_PATH, doc);

const { min, max } = getBounds(scene);
const mm = (m) => Math.round(m * 1000);
console.log(`Wrote ${OUTPUT_PATH} (${((await stat(OUTPUT_PATH)).size / 1e6).toFixed(2)} MB)`);
console.log(`Size (mm): length ${mm(max[2] - min[2])}, width ${mm(max[0] - min[0])}, height ${mm(max[1] - min[1])}`);
console.log(`Bounds (m): min ${min.map((v) => v.toFixed(3))}, max ${max.map((v) => v.toFixed(3))}`);
console.log(`Wheelbase ${mm(rear.z - front.z)} mm, front track ${mm(front.halfTrack * 2)} mm, rear track ${mm(rear.halfTrack * 2)} mm`);
console.log('Mounts:', mountPos);
