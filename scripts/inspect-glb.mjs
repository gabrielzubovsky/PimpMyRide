// Prints how a GLB is put together: its node tree, which nodes carry meshes,
// their materials and world-space bounds. Use it before writing a car's prep
// config, to find the wheel meshes, the paint and glass materials, and which
// way the model faces.
//
// Run with: node scripts/inspect-glb.mjs assets-src/toyota-supra-a80.glb [--all | --materials]
//   --all        also lists tiny mesh nodes (bolts, badges, …)
//   --materials  one line per material instead of the node tree: how many
//                primitives use it and where they are. Best for big models.

import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { getBounds } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import { MeshoptDecoder } from 'meshoptimizer';

const [file, flag] = process.argv.slice(2);
if (!file) {
  console.error('Usage: node scripts/inspect-glb.mjs <file.glb> [--all]');
  process.exit(1);
}

await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'draco3d.decoder': await draco3d.createDecoderModule(),
  'meshopt.decoder': MeshoptDecoder,
});
const doc = await io.read(file);
const root = doc.getRoot();
const scene = root.getDefaultScene() ?? root.listScenes()[0];

const f = (v) => v.toFixed(3);
const box = (b) => `[${b.min.map(f).join(', ')}] → [${b.max.map(f).join(', ')}]`;
const size = (b) => b.max.map((v, i) => v - b.min[i]);

const sb = getBounds(scene);
const ss = size(sb);
// "Tiny" is relative: some models come in at 1:100 scale.
const tiny = Math.max(...ss) * 0.005;
console.log(`Scene bounds ${box(sb)}`);
console.log(`Size x ${f(ss[0])}  y ${f(ss[1])}  z ${f(ss[2])}`);
console.log(`Nodes ${root.listNodes().length}, meshes ${root.listMeshes().length}, materials ${root.listMaterials().length}\n`);

function walk(node, depth) {
  const mesh = node.getMesh();
  const pad = '  '.repeat(depth);
  let line = `${pad}${node.getName() || '(unnamed)'}`;
  if (mesh) {
    const b = getBounds(node);
    const s = size(b);
    const small = Math.max(...s) < tiny;
    if (small && flag !== '--all' && node.listChildren().length === 0) return;
    const mats = [...new Set(mesh.listPrimitives().map((p) => p.getMaterial()?.getName() ?? '-'))];
    line += `  [mesh ${mesh.getName() || '-'}; mat ${mats.join(', ')}]  ${box(b)}`;
  }
  const s = node.getScale();
  if (s.some((v) => Math.abs(v - 1) > 1e-6)) line += `  scale ${s.map(f).join(',')}`;
  console.log(line);
  for (const child of node.listChildren()) walk(child, depth + 1);
}
if (flag === '--materials') {
  // Union of world bounds per material, from each primitive's node.
  const byMat = new Map();
  for (const node of root.listNodes()) {
    const mesh = node.getMesh();
    if (!mesh) continue;
    const b = getBounds(node);
    for (const prim of mesh.listPrimitives()) {
      const name = prim.getMaterial()?.getName() ?? '(none)';
      const e = byMat.get(name) ?? { count: 0, nodes: new Set(), min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
      e.count++;
      e.nodes.add(node.getName());
      for (let a = 0; a < 3; a++) {
        e.min[a] = Math.min(e.min[a], b.min[a]);
        e.max[a] = Math.max(e.max[a], b.max[a]);
      }
      byMat.set(name, e);
    }
  }
  for (const [name, e] of [...byMat].sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(`${name}  ×${e.count}  ${box(e)}`);
  }
} else {
  for (const child of scene.listChildren()) walk(child, 0);
}

console.log('\nMaterials');
for (const m of root.listMaterials()) {
  const c = m.getBaseColorFactor().map((v) => v.toFixed(2)).join(',');
  console.log(`  ${m.getName() || '(unnamed)'}  color ${c}  metal ${m.getMetallicFactor()}  rough ${m.getRoughnessFactor()}  alpha ${m.getAlphaMode()}${m.getBaseColorTexture() ? '  textured' : ''}`);
}
