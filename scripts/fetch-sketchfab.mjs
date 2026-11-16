// Downloads the Sketchfab models picked for the outline-only cars, using the
// Sketchfab Download API (free; needs a logged-in account's API token).
//
// Setup, once: put your token in .env.local at the project root, as
//   SKETCHFAB_TOKEN=...
// (from sketchfab.com → Settings → Password & API). .env.local is git-ignored.
// The token is only ever sent to api.sketchfab.com and never printed.
//
// What it does, per car:
//   1. Finds the model id in the Sketchfab link in the car's `source`
//      (src/data/more-cars.ts).
//   2. Checks the model's licence and that it is downloadable.
//   3. Asks the Download API for a short-lived download link, preferring a
//      single .glb; otherwise it takes the glTF zip, unpacks it and converts it
//      to .glb with glTF Transform.
//   4. Saves assets-src/<car id>.glb. Cars already downloaded are skipped.
//
// Run with: node scripts/fetch-sketchfab.mjs            (every car with a link)
//      or:  node scripts/fetch-sketchfab.mjs bmw-m3-e30  (just these cars)
//      or:  node scripts/fetch-sketchfab.mjs --model <uid> <name>
//           (any one model, saved as assets-src/<name>.glb, to try a candidate)

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { MeshoptDecoder } from 'meshoptimizer';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = resolve(root, 'assets-src');
// The 458 and 992 come from GitHub mirrors through their own prep scripts.
const DATA_FILES = ['src/data/more-cars.ts', 'src/data/civics.ts'];
const API = 'https://api.sketchfab.com/v3';

// --- Token --------------------------------------------------------------------

function readToken() {
  if (process.env.SKETCHFAB_TOKEN) return process.env.SKETCHFAB_TOKEN.trim();
  const envFile = resolve(root, '.env.local');
  if (existsSync(envFile)) {
    for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*SKETCHFAB_TOKEN\s*=\s*["']?([^"'\s]+)["']?\s*$/);
      if (m) return m[1];
    }
  }
  return null;
}

// --- Which models -------------------------------------------------------------

/** Car id → Sketchfab model id, read from the model links in the car data. */
function findModels() {
  const found = [];
  for (const file of DATA_FILES) {
    const text = readFileSync(resolve(root, file), 'utf8');
    // Each car entry runs from one `id: '…'` to the next.
    const entries = text.split(/\n\s+id: '/).slice(1);
    for (const entry of entries) {
      const carId = entry.slice(0, entry.indexOf("'"));
      const link = entry.match(/https:\/\/sketchfab\.com\/3d-models\/[\w-]*?([0-9a-f]{32})\b/);
      if (link) found.push({ carId, uid: link[1] });
    }
  }
  return found;
}

// --- API ----------------------------------------------------------------------

async function api(path, token) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`${API}${path}`, {
      headers: token ? { Authorization: `Token ${token}` } : {},
    });
    if (res.status === 429) {
      // Rate limited: wait and try again.
      const wait = Number(res.headers.get('retry-after') ?? 10) * 1000;
      console.log(`  rate limited, waiting ${wait / 1000}s`);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      const err = new Error(`HTTP ${res.status} on ${path}: ${body.slice(0, 200)}`);
      err.status = res.status;
      throw err;
    }
    return res.json();
  }
  throw new Error(`Still rate limited on ${path}`);
}

/** Downloads a signed file URL. These carry their own auth, so no token is sent. */
async function download(url, path) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} downloading the file`);
  await writeFile(path, Buffer.from(await res.arrayBuffer()));
}

// --- glTF zip → GLB -------------------------------------------------------------

async function io() {
  await MeshoptDecoder.ready;
  return new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
      'draco3d.decoder': await draco3d.createDecoderModule(),
      'meshopt.decoder': MeshoptDecoder,
    });
}

async function findGltf(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      const inner = await findGltf(path);
      if (inner) return inner;
    } else if (entry.name.endsWith('.gltf')) {
      return path;
    }
  }
  return null;
}

async function zipToGlb(zipPath, glbPath, workDir) {
  // Downloaded archives are untrusted: unpack into a fresh, empty folder.
  await rm(workDir, { recursive: true, force: true });
  await mkdir(workDir, { recursive: true });
  execFileSync('unzip', ['-q', '-o', zipPath, '-d', workDir]);
  const gltf = await findGltf(workDir);
  if (!gltf) throw new Error('No .gltf file inside the zip');
  const reader = await io();
  const doc = await reader.read(gltf);
  await reader.writeBinary(doc).then((bytes) => writeFile(glbPath, bytes));
}

// --- Main -----------------------------------------------------------------------

const mb = (bytes) => `${(bytes / 1e6).toFixed(1)} MB`;

async function main() {
  const token = readToken();
  if (!token) {
    console.error('No SKETCHFAB_TOKEN found in the environment or in .env.local.');
    process.exit(1);
  }

  const wanted = process.argv.slice(2);
  let models;
  if (wanted[0] === '--model') {
    const [, uid, name] = wanted;
    if (!/^[0-9a-f]{32}$/.test(uid ?? '') || !/^[\w-]+$/.test(name ?? '')) {
      console.error('Usage: node scripts/fetch-sketchfab.mjs --model <32-hex uid> <name>');
      process.exit(1);
    }
    models = [{ carId: name, uid }];
  } else {
    models = findModels();
    if (wanted.length) models = models.filter((m) => wanted.includes(m.carId));
  }
  if (!models.length) {
    console.error('No cars with a Sketchfab link matched.');
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });
  const results = [];

  for (const { carId, uid } of models) {
    const glbPath = resolve(OUT_DIR, `${carId}.glb`);
    console.log(`\n${carId}  (sketchfab ${uid})`);
    if (existsSync(glbPath)) {
      console.log(`  already downloaded: assets-src/${carId}.glb`);
      results.push({ carId, status: 'skipped' });
      continue;
    }
    try {
      // Public metadata: confirm the licence and that downloads are allowed.
      const meta = await api(`/models/${uid}`);
      const licence = meta.license?.label ?? 'unknown licence';
      console.log(`  "${meta.name}" by ${meta.user?.displayName ?? meta.user?.username}, ${licence}`);
      if (!meta.isDownloadable) throw new Error('The author has not made this model downloadable');
      if (!/CC Attribution/i.test(licence) || /NonCommercial|NoDerivs/i.test(licence)) {
        console.log(`  note: licence is "${licence}", check it before using the model`);
      }

      const options = await api(`/models/${uid}/download`, token);
      if (options.glb?.url) {
        console.log(`  downloading glb (${mb(options.glb.size ?? 0)})`);
        await download(options.glb.url, glbPath);
      } else if (options.gltf?.url) {
        console.log(`  downloading glTF zip (${mb(options.gltf.size ?? 0)}) and converting to glb`);
        const zipPath = resolve(OUT_DIR, `${carId}.zip`);
        const workDir = resolve(OUT_DIR, `${carId}-gltf`);
        await download(options.gltf.url, zipPath);
        await zipToGlb(zipPath, glbPath, workDir);
        await rm(zipPath, { force: true });
        await rm(workDir, { recursive: true, force: true });
      } else {
        throw new Error(`No glb or glTF offered (formats: ${Object.keys(options).join(', ') || 'none'})`);
      }

      const size = (await stat(glbPath)).size;
      console.log(`  saved assets-src/${carId}.glb (${mb(size)})`);
      results.push({ carId, status: 'ok', size, licence });
    } catch (err) {
      const hint =
        err.status === 401
          ? ' — the token was refused; check SKETCHFAB_TOKEN in .env.local'
          : err.status === 403
            ? ' — Sketchfab would not allow this download'
            : '';
      console.log(`  FAILED: ${err.message}${hint}`);
      results.push({ carId, status: 'failed', error: err.message });
      if (err.status === 401) break; // a bad token fails every model the same way
    }
    await new Promise((r) => setTimeout(r, 1500)); // be gentle with the API
  }

  console.log('\nSummary');
  for (const r of results) {
    console.log(`  ${r.status.padEnd(7)} ${r.carId}${r.size ? `  ${mb(r.size)}` : ''}${r.error ? `  ${r.error}` : ''}`);
  }
  if (results.some((r) => r.status === 'failed')) process.exitCode = 1;
}

main();
