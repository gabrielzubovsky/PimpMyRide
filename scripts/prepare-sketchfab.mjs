// Prepares a downloaded Sketchfab car (see fetch-sketchfab.mjs) for the
// garage, without Blender. One config entry per car says which parts are
// what; everything else is measured from the model itself.
//
// What it does:
//   1. Finds the four wheel centres by splitting the tyre vertices into
//      corners. That works whether the model has one tyre mesh per wheel or
//      all four merged into one.
//   2. Scales the model so its wheelbase matches the real car's.
//   3. Turns it so the nose points to -z (our convention), puts the tyres on
//      y = 0 and centres it between the axles, so the car's real dimensions
//      line up with the model (the engine bay is placed from those).
//   4. Deletes the baked wheels, tyres and brakes (the garage generates its
//      own) plus anything listed in `remove`, such as a baked engine.
//   5. Renames the materials of the paint, glass and leather parts to
//      `paint`, `glass` and `leather`, which is how the garage finds them.
//   6. Adds mount_wheel_fl / fr / rl / rr nodes at the measured centres.
//   7. Recompresses with Meshopt into public/models/<car id>.glb.
//
// Run with: node scripts/prepare-sketchfab.mjs toyota-supra-a80   (or --all)
// Inspect a model first with:
//   node scripts/inspect-glb.mjs assets-src/<car id>.glb [--materials]

import { existsSync } from 'node:fs';
import { mkdir, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, getBounds, meshopt, metalRough, prune } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Per-car setup. Each part list holds selectors:
 *   'Name'          a node (as inspect-glb.mjs prints it) and everything under it
 *   { mat: 're' }   every primitive whose material name matches the regex
 *
 *   nose       which way the nose points in the source: '+z', '-z', '+x' or '-x'
 *   wheelbase  the real car's wheelbase in metres (from its sizeM)
 *   tyres      the tyres, measured to find the wheel centres, then deleted
 *   wheels     everything else on the wheels to delete: rims, brakes, badges
 *   remove     anything else to delete (a baked engine would clash with the
 *              garage's generated one)
 *   paint, glass, leather   parts the garage recolours
 *   colors     { 'material regex': '#hex' or { color, metal, rough } } for
 *              parts that arrive without textures and would render plain white
 */
/** Game-style models (the TNR naming) arrive untextured: give the trim sensible colours. */
const TNR_COLORS = {
  Base_Material: { color: '#121314', metal: 0, rough: 0.7 }, // unpainted black plastic
  glass_surr: { color: '#0b0c0d', metal: 0, rough: 0.5 }, // window rubbers and frit
  InteriorA_Material: { color: '#2a2b2e', metal: 0, rough: 0.8 },
  '^Interior_C$': { color: '#2a2b2e', metal: 0, rough: 0.8 },
  Carbon: { color: '#1b1c1e', metal: 0.15, rough: 0.32 },
  Grille: { color: '#1a1b1d', metal: 0.2, rough: 0.6 },
  TexturedA: { color: '#3a3c40', metal: 0, rough: 0.7 },
  SeatBelt: { color: '#141516', metal: 0, rough: 0.9 },
};

const CARS = {
  'toyota-supra-a80': {
    nose: '+z', // brake and reverse lights sit at -z
    wheelbase: 2.55,
    tyres: ['Object_17'],
    wheels: ['Object_16', 'Object_18', 'Object_19', 'Object_20', 'Object_21'],
    paint: ['Object_2'],
    glass: ['Object_9'],
  },
  'vw-golf-gti-mk1': {
    nose: '+z', // red tail lights (Polygon_Objekt_11) sit at -z
    wheelbase: 2.4,
    tyres: ['Polygon_Objekt_21', 'Polygon_Objekt_22'],
    wheels: ['Polygon_Objekt'],
    remove: ['CINEMA_4D_Editor'],
    paint: ['Polygon_Objekt_2'],
    glass: ['Polygon_Objekt_23', 'Polygon_Objekt_24', 'Polygon_Objekt_25', 'Polygon_Objekt_26', 'Polygon_Objekt_27', 'Polygon_Objekt_28'],
  },
  'nissan-skyline-r34': {
    nose: '+z', // the engine mesh sits at +z
    wheelbase: 2.67,
    tyres: [{ mat: 'TireBlur' }],
    wheels: [{ mat: 'TNR_Rim' }, { mat: 'BrakeDisc' }, { mat: 'Calliper' }, { mat: '^phong3$' }],
    remove: [{ mat: 'EngineA_Material' }],
    paint: [{ mat: 'PaintTNR' }, { mat: 'Coloured_Material' }],
    glass: [{ mat: 'Window_Material' }],
    colors: TNR_COLORS,
  },
  'mazda-rx7-fd': {
    nose: '+z', // the engine mesh sits at +z
    wheelbase: 2.43,
    tyres: [{ mat: 'TireBlur' }],
    wheels: [{ mat: 'TNR_Rim' }, { mat: 'BrakeDisc' }, { mat: 'Callipers' }, { mat: '^Calip_Col$' }],
    // Grille7A renders as two solid posts: its see-through texture is missing.
    remove: [{ mat: 'EngineA_Material' }, { mat: 'Grille7A' }],
    paint: [{ mat: 'PaintTNR' }, { mat: 'Coloured_Material' }],
    glass: [{ mat: 'Window_Material' }],
    colors: TNR_COLORS,
  },
  'subaru-impreza-gc8': {
    nose: '-z', // battery and intercooler pipe sit at -z
    wheelbase: 2.52,
    tyres: [{ mat: '^Tire1Mtl$' }],
    wheels: [{ mat: '^Rim1Mtl$' }, { mat: '^RimRef' }, { mat: '^Hub1Mtl$' }, { mat: '^Mesheswheelbrake' }],
    paint: [{ mat: '^Body1Mtl$' }],
    glass: [{ mat: '^Meshpart12Mtl$' }, { mat: '^Meshpart3Mtl$' }],
  },
  'bmw-m3-e30': {
    nose: '+z', // headlight reflectors sit at +z
    wheelbase: 2.57,
    tyres: [{ mat: '^BMW_E30_M3_TIRE$' }],
    wheels: [{ mat: '^BMW_E30_M3_RIM$' }, { mat: '^Brake_Disc$' }, { mat: '^Brembo_Calipers$' }, { mat: '^Logo_Plane$' }],
    paint: [{ mat: '^BMW_E30_M3_PAINT$' }],
    glass: [{ mat: '^BMW_E30_M3_WINDOWS$' }],
  },
  'mercedes-190e': {
    nose: '+z', // the radiator sits at +z
    wheelbase: 2.67,
    tyres: [{ mat: '^EXT_Tyre' }],
    wheels: [{ mat: '^EXT_Rim' }, { mat: '^EXT_Brake_Disc' }, { mat: '^EXT_Calipers' }],
    remove: [{ mat: '^ENG_Main' }, { mat: '^ENG_Radiator' }],
    paint: [{ mat: '^EXT_Car_Paint' }, { mat: '^ENG_Car_Paint' }],
    glass: [{ mat: '^EXT_Glass\\.' }],
    leather: [{ mat: '^INT_Leather' }],
  },
  'porsche-911-964': {
    nose: '+z', // the engine sits at -z, behind the rear axle
    wheelbase: 2.27,
    tyres: [{ mat: '^tire$' }],
    wheels: [{ mat: '^material_21$' }, { mat: '^Disk$' }],
    remove: [{ mat: '^Engine_Metal$' }, { mat: '^Engine_T$' }],
    paint: [{ mat: '^CarPaint$' }],
    glass: [{ mat: '^Windows$' }],
    leather: [{ mat: '^Cabin_Leahter$' }],
  },
  'ford-mustang-1965': {
    nose: '+z', // the badge sits at +z, tail lights at -z
    wheelbase: 2.74,
    tyres: [{ mat: '^bfgoodri$' }], // BFGoodrich-branded tyres
    wheels: [{ mat: '^2011_06$' }, { mat: '^0045_Gol$' }, { mat: '^Gray_2$' }, { mat: '^material$' }],
    paint: [{ mat: '^Color_04$' }],
    // No window glass in this model.
  },
  'lamborghini-countach': {
    nose: '+z', // headlights sit at +z
    wheelbase: 2.45,
    tyres: [{ mat: '^Tyre$' }],
    wheels: [{ mat: '^EXT_metal_rim' }, { mat: '^EXT_metal_disk$' }, { mat: '^EXT_metal_caliper$' }],
    remove: [{ mat: '^DAMAGE_GLASS$' }], // a crash-damage variant of the glass
    paint: [{ mat: '^EXT_Body_paint' }, { mat: '^INT_Cockpit_CARPAINT$' }],
    glass: [{ mat: '^EXT_glass_windows$' }, { mat: '^INT_Windscreen$' }],
    leather: [{ mat: '^INT_Occ_SEAT$' }],
  },
};

const YAW = { '-z': 0, '+z': Math.PI, '+x': Math.PI / 2, '-x': -Math.PI / 2 };

// --- Setup ---------------------------------------------------------------------

const arg = process.argv[2];
const ids = arg === '--all' ? Object.keys(CARS) : [arg];
if (!arg || ids.some((id) => !CARS[id])) {
  console.error(`Usage: node scripts/prepare-sketchfab.mjs <car id | --all>\nConfigured: ${Object.keys(CARS).join(', ')}`);
  process.exit(1);
}

await MeshoptDecoder.ready;
await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'draco3d.decoder': await draco3d.createDecoderModule(),
  'meshopt.decoder': MeshoptDecoder,
  'meshopt.encoder': MeshoptEncoder,
});

for (const id of ids) await prepare(id, CARS[id]);

// --- One car -------------------------------------------------------------------

async function prepare(carId, config) {
  const SOURCE = resolve(root, 'assets-src', `${carId}.glb`);
  const OUTPUT = resolve(root, 'public/models', `${carId}.glb`);
  if (!existsSync(SOURCE)) throw new Error(`Missing ${SOURCE}. Run: node scripts/fetch-sketchfab.mjs ${carId}`);

  const doc = await io.read(SOURCE);
  const docRoot = doc.getRoot();
  const scene = docRoot.getDefaultScene() ?? docRoot.listScenes()[0];
  // Draco gets decoded on read; drop the extension so the output uses Meshopt only.
  docRoot
    .listExtensionsUsed()
    .find((ext) => ext.extensionName === 'KHR_draco_mesh_compression')
    ?.dispose();

  const subtree = (node) => [node, ...node.listChildren().flatMap(subtree)];
  const byName = (name) => {
    const matches = docRoot.listNodes().filter((n) => n.getName() === name);
    if (matches.length !== 1) throw new Error(`Expected one node named "${name}", found ${matches.length}`);
    return matches[0];
  };

  /** The (node, primitive) pairs a list of selectors picks out. */
  function pick(selectors = []) {
    const pairs = [];
    for (const sel of selectors) {
      const before = pairs.length;
      if (typeof sel === 'string') {
        for (const node of subtree(byName(sel))) {
          for (const prim of node.getMesh()?.listPrimitives() ?? []) pairs.push({ node, prim });
        }
      } else {
        const re = new RegExp(sel.mat);
        for (const node of docRoot.listNodes()) {
          for (const prim of node.getMesh()?.listPrimitives() ?? []) {
            if (re.test(prim.getMaterial()?.getName() ?? '')) pairs.push({ node, prim });
          }
        }
      }
      if (pairs.length === before) throw new Error(`Selector ${JSON.stringify(sel)} matched nothing`);
    }
    return pairs;
  }

  // --- 1. Measure the wheel centres from the tyres -------------------------------

  // Tyre vertices in world space (not yet turned or scaled).
  const raw = [];
  const v = [0, 0, 0];
  for (const { node, prim } of pick(config.tyres)) {
    const m = node.getWorldMatrix(); // column-major 4×4
    const pos = prim.getAttribute('POSITION');
    for (let i = 0; i < pos.getCount(); i++) {
      pos.getElement(i, v);
      raw.push([
        m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12],
        m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13],
        m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14],
      ]);
    }
  }

  /** Turns the tyre points by `yaw` and boxes each corner (front is −z, left is −x). */
  function measure(yaw) {
    const cos = Math.cos(yaw);
    const sin = Math.sin(yaw);
    const points = raw.map(([x, y, z]) => [x * cos + z * sin, y, -x * sin + z * cos]);
    const lo = [Infinity, Infinity, Infinity];
    const hi = [-Infinity, -Infinity, -Infinity];
    for (const p of points) for (let a = 0; a < 3; a++) (lo[a] = Math.min(lo[a], p[a])), (hi[a] = Math.max(hi[a], p[a]));
    const midX = (lo[0] + hi[0]) / 2;
    const midZ = (lo[2] + hi[2]) / 2;
    const corners = {};
    for (const p of points) {
      const key = `${p[2] < midZ ? 'f' : 'r'}${p[0] < midX ? 'l' : 'r'}`;
      const c = (corners[key] ??= { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] });
      for (let a = 0; a < 3; a++) (c.min[a] = Math.min(c.min[a], p[a])), (c.max[a] = Math.max(c.max[a], p[a]));
    }
    if (Object.keys(corners).length !== 4) throw new Error(`Found ${Object.keys(corners).length} tyre corners, expected 4`);
    const centre = (c) => c.min.map((l, a) => (l + c.max[a]) / 2);
    const C = Object.fromEntries(Object.entries(corners).map(([k, c]) => [k, centre(c)]));
    return { lo, hi, midX, corners, C };
  }

  // Some models sit a fraction of a degree off straight. Each axle runs
  // left to right, so its angle in plan view is how far off the model is.
  let yaw = YAW[config.nose];
  let m = measure(yaw);
  const skew = (m) =>
    (Math.atan2(m.C.fr[2] - m.C.fl[2], m.C.fr[0] - m.C.fl[0]) + Math.atan2(m.C.rr[2] - m.C.rl[2], m.C.rr[0] - m.C.rl[0])) / 2;
  const straighten = skew(m);
  if (Math.abs(straighten) > 0.001) {
    yaw += straighten;
    m = measure(yaw);
  }
  const { lo, midX, corners, C } = m;
  const groundY = lo[1];
  const tyreDiameter = Math.max(...Object.values(corners).map((c) => c.max[1] - c.min[1]));
  const frontZ = (C.fl[2] + C.fr[2]) / 2;
  const rearZ = (C.rl[2] + C.rr[2]) / 2;
  if (rearZ <= frontZ) throw new Error('Rear axle is ahead of the front axle: check `nose`');
  const sourceWheelbase = rearZ - frontZ;

  // --- 2 and 3. Scale, turn and place the whole model ------------------------------

  const s = config.wheelbase / sourceWheelbase;
  const t = [-s * midX, -s * groundY, -s * ((frontZ + rearZ) / 2)];
  const place = (p) => [s * p[0] + t[0], s * p[1] + t[1], s * p[2] + t[2]];

  const carRoot = doc.createNode('car');
  for (const child of scene.listChildren()) {
    scene.removeChild(child);
    carRoot.addChild(child);
  }
  scene.addChild(carRoot);
  carRoot
    .setScale([s, s, s])
    .setRotation([0, Math.sin(yaw / 2), 0, Math.cos(yaw / 2)])
    .setTranslation(t);

  // --- 4. Remove the baked wheels and extras ---------------------------------------

  const doomed = [...(config.tyres ?? []), ...(config.wheels ?? []), ...(config.remove ?? [])];
  const deadPrims = new Set();
  for (const sel of doomed) {
    if (typeof sel === 'string') {
      const node = byName(sel);
      for (const n of subtree(node).reverse()) n.dispose();
    } else {
      for (const { prim } of pick([sel])) deadPrims.add(prim);
    }
  }
  for (const mesh of docRoot.listMeshes()) {
    for (const prim of mesh.listPrimitives()) if (deadPrims.has(prim)) mesh.removePrimitive(prim);
  }
  for (const prim of deadPrims) prim.dispose();

  // --- 5. Name the materials the garage recolours -------------------------------------

  const counts = {};
  for (const role of ['paint', 'glass', 'leather']) {
    const pairs = pick(config[role]);
    // Node selectors may share a material with parts that are not paint, so
    // give those primitives their own copy before renaming it.
    const copies = new Map();
    for (const { prim } of pairs) {
      const mat = prim.getMaterial();
      if (!mat) continue;
      if (!copies.has(mat)) copies.set(mat, mat.clone().setName(role));
      prim.setMaterial(copies.get(mat));
    }
    counts[role] = pairs.length;
  }

  // Untextured parts: set their colour and finish.
  for (const [pattern, spec] of Object.entries(config.colors ?? {})) {
    const { color, metal = 0, rough = 0.6 } = typeof spec === 'string' ? { color: spec } : spec;
    const rgb = [1, 3, 5].map((i) => (parseInt(color.slice(i, i + 2), 16) / 255) ** 2.2); // sRGB → linear
    const re = new RegExp(pattern);
    for (const mat of docRoot.listMaterials()) {
      if (!re.test(mat.getName())) continue;
      const alpha = mat.getBaseColorFactor()[3];
      mat.setBaseColorFactor([...rgb, alpha]).setMetallicFactor(metal).setRoughnessFactor(rough);
    }
  }

  // --- 6. Wheel mounts ----------------------------------------------------------------

  const mounts = {};
  for (const [key, c] of Object.entries(C)) {
    mounts[`mount_wheel_${key}`] = place(c);
    scene.addChild(doc.createNode(`mount_wheel_${key}`).setTranslation(mounts[`mount_wheel_${key}`]));
  }

  // --- 7. Clean up and compress -------------------------------------------------------

  await doc.transform(
    metalRough(), // older specular-glossiness materials, which three.js no longer reads
    prune({ keepLeaves: true }),
    dedup({ keepUniqueNames: true }), // keep 'paint', 'glass' and 'leather' apart from look-alikes
    meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
  );
  await mkdir(dirname(OUTPUT), { recursive: true });
  await io.write(OUTPUT, doc);

  // --- Report -----------------------------------------------------------------------

  const mm = (m) => Math.round(m * 1000);
  const { min, max } = getBounds(scene);
  console.log(`${carId}`);
  console.log(`  scale ${s.toPrecision(4)} (source wheelbase ${sourceWheelbase.toPrecision(4)} → ${mm(config.wheelbase)} mm), nose was ${config.nose}${Math.abs(straighten) > 0.001 ? `, straightened ${((straighten * 180) / Math.PI).toFixed(2)}°` : ''}`);
  console.log(`  size ${mm(max[0] - min[0])} × ${mm(max[1] - min[1])} × ${mm(max[2] - min[2])} mm (w × h × l), top ${mm(max[1])} mm`);
  console.log(`  baked tyre diameter ${mm(tyreDiameter * s)} mm`);
  console.log(`  ends: [${min[2].toFixed(3)}, ${max[2].toFixed(3)}]  (nose and tail z, for the car's \`prepared.ends\`)`);
  for (const [name, p] of Object.entries(mounts).sort()) console.log(`  ${name}  ${p.map((v) => mm(v)).join(', ')} mm`);
  console.log(`  primitives: ${counts.paint} paint, ${counts.glass} glass, ${counts.leather} leather; removed ${deadPrims.size} by material`);
  console.log(`  wrote public/models/${carId}.glb (${((await stat(OUTPUT)).size / 1e6).toFixed(2)} MB)`);
}
