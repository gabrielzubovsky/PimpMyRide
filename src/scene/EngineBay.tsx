import { useEffect, useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import type { PartRender } from '../data/catalog';
import type { CarDef, EngineSpec } from '../data/types';
import { engineLayout, engineYaw, toCar, type EngineLayout, type V3 } from '../parts/engine';
import { useGarage } from '../state/garage';
import { bodyEnds } from './ends';
import { useRender } from './Mods';

// The engine bay: the bay itself (inner wings, strut towers, firewall, or a
// tub behind the cabin), the engine generated from the car's engine specs,
// and any engine-bay parts from the build. Positions come from the car's real
// dimensions, so every car gets a bay, including the outline-only ones.

export interface Bay {
  /** Which end of the car the bay opens at. */
  end: 'front' | 'rear';
  /** Crank centre, car space. */
  center: V3;
  yaw: number;
  layout: EngineLayout;
  /** In the engine view, body above clipY and past clipZ is cut away. */
  clipY: number;
  clipZ: number;
  /** Bay walls: the firewall or bulkhead on the cabin side, and the far end. */
  near: number;
  far: number;
  halfWidth: number;
  floorY: number;
  /** Axle at this end of the car, where the strut towers stand. */
  axleZ: number;
  /** Driver's side across the car: -1 left, 1 right. The brake booster sits there. */
  driverSide: 1 | -1;
}

/** Works out where the bay is, from model data or from the car's dimensions. */
export function bayFor(car: CarDef): Bay | null {
  const e = car.engine;
  const layout = engineLayout(e);
  const yaw = engineYaw(e);
  const { width: w, height: h, wheelbase: wb, trackFront, trackRear } = car.sizeM;
  const end = e.position === 'front' ? 'front' : 'rear';
  const toward = end === 'front' ? -1 : 1; // sign of z toward the bay's end of the car
  const axleZ = (toward * wb) / 2;
  const driverSide = car.rhd ? 1 : -1;

  if (car.engineBay) {
    const { center, clipY, clipZ, width } = car.engineBay;
    const near = clipZ - toward * 0.13;
    return {
      end,
      center,
      yaw,
      layout,
      clipY,
      clipZ,
      near,
      far: center[2] + (center[2] - near),
      halfWidth: width / 2,
      floorY: center[1] + layout.sumpY - 0.04,
      axleZ,
      driverSide,
    };
  }
  // Otherwise work it out from the car's dimensions. That holds for outline
  // cars, and for models from prepare-sketchfab.mjs, which centres every
  // model between its axles at its real size.
  // Engine size along the car: a transverse engine lies across it.
  const along = e.mounting === 'transverse' ? layout.halfWidth * 2 : layout.length + 0.1;
  const crankY = Math.max(0.3, h * 0.27);
  let z: number;
  if (e.position === 'front') {
    // Transverse engines sit over the front axle; longitudinal ones start
    // just ahead of it and run back toward the firewall (front-mid engine).
    z = e.mounting === 'transverse' ? axleZ - 0.02 : axleZ + layout.length / 2 - 0.12;
  } else if (e.position === 'rear') {
    z = axleZ + 0.3; // hung out behind the rear axle
  } else {
    z = axleZ - layout.length / 2 - 0.1; // ahead of the rear axle
  }
  const near = z - toward * (along / 2 + 0.15);
  const track = end === 'front' ? trackFront : trackRear;
  return {
    end,
    center: [0, crankY, z],
    yaw,
    layout,
    clipY: h * 0.42,
    clipZ: near,
    near,
    // The bay ends a little inside the bumper: further in on a real model,
    // whose bumper face curves back at the corners.
    far: end === 'front' ? bodyEnds(car).nose + (car.modelUrl ? 0.25 : 0.12) : bodyEnds(car).tail - (car.modelUrl ? 0.25 : 0.12),
    halfWidth: Math.min(w / 2 - 0.2, track / 2 - 0.17),
    floorY: crankY + layout.sumpY - 0.05,
    axleZ,
    driverSide,
  };
}

/** Clipping planes that open the bay: cut what is above clipY and past clipZ. */
export function bayClipPlanes(bay: Bay): THREE.Plane[] {
  return [
    new THREE.Plane(new THREE.Vector3(0, -1, 0), bay.clipY),
    bay.end === 'rear'
      ? new THREE.Plane(new THREE.Vector3(0, 0, -1), bay.clipZ)
      : new THREE.Plane(new THREE.Vector3(0, 0, 1), -bay.clipZ),
  ];
}

// --- Materials ---------------------------------------------------------------

function useBayMaterials(engine: EngineSpec) {
  const paintHex = useGarage((s) => s.paintHex);
  const m = useMemo(
    () => ({
      cover: new THREE.MeshStandardMaterial({
        color: engine.coverHex,
        roughness: engine.crinkle ? 0.62 : 0.35,
        metalness: engine.crinkle ? 0.25 : 0.4,
      }),
      alloy: new THREE.MeshStandardMaterial({ color: '#9aa0a5', roughness: 0.38, metalness: 0.9 }),
      block: new THREE.MeshStandardMaterial({ color: '#5c6066', roughness: 0.45, metalness: 0.85 }),
      iron: new THREE.MeshStandardMaterial({ color: '#4d4743', roughness: 0.7, metalness: 0.6 }),
      header: new THREE.MeshStandardMaterial({ color: '#8b7d70', roughness: 0.35, metalness: 0.95 }),
      black: new THREE.MeshStandardMaterial({ color: '#141518', roughness: 0.75, metalness: 0.1 }),
      rubber: new THREE.MeshStandardMaterial({ color: '#0e0e10', roughness: 0.9, metalness: 0 }),
      carbon: new THREE.MeshStandardMaterial({ color: '#1b1c1e', roughness: 0.32, metalness: 0.15 }),
      // Not a perfect mirror: the garage is dark, so a mirror would read black.
      polished: new THREE.MeshStandardMaterial({ color: '#e2e5e8', roughness: 0.22, metalness: 0.85 }),
      bronze: new THREE.MeshStandardMaterial({ color: '#8c6d3f', roughness: 0.4, metalness: 0.9 }),
      reservoir: new THREE.MeshStandardMaterial({ color: '#e8e4d8', roughness: 0.5, transparent: true, opacity: 0.85 }),
      red: new THREE.MeshStandardMaterial({ color: '#b3161b', roughness: 0.5 }),
      // Front bays are part of the steel shell, so they wear the body colour.
      painted: new THREE.MeshPhysicalMaterial({ roughness: 0.3, metalness: 0.2, clearcoat: 0.6 }),
    }),
    [engine],
  );
  useEffect(() => () => Object.values(m).forEach((mat) => mat.dispose()), [m]);
  useEffect(() => void m.painted.color.set(paintHex), [m, paintHex]);
  return m;
}

type Mats = ReturnType<typeof useBayMaterials>;

// --- Small shape helpers -----------------------------------------------------

/** A box from its centre and size. */
function Box({ at, size, mat, rot }: { at: V3; size: V3; mat: THREE.Material; rot?: V3 }) {
  return (
    <mesh position={at} rotation={rot} material={mat}>
      <boxGeometry args={size} />
    </mesh>
  );
}

/** A round part with its axis along X, Y or Z. */
function Drum({ at, r, depth, axis, mat, r2 }: { at: V3; r: number; depth: number; axis: 'x' | 'y' | 'z'; mat: THREE.Material; r2?: number }) {
  const rot: V3 = axis === 'x' ? [0, 0, Math.PI / 2] : axis === 'z' ? [Math.PI / 2, 0, 0] : [0, 0, 0];
  return (
    <mesh position={at} rotation={rot} material={mat}>
      <cylinderGeometry args={[r2 ?? r, r, depth, 24]} />
    </mesh>
  );
}

/** A tube through a list of points: straight between two, curved through more. */
function Pipe({ points, r, mat }: { points: V3[]; r: number; mat: THREE.Material }) {
  const key = points.map((p) => p.map((v) => v.toFixed(4)).join(',')).join(';');
  const geometry = useMemo(() => {
    const v = points.map((p) => new THREE.Vector3(...p));
    const curve = v.length === 2 ? new THREE.LineCurve3(v[0], v[1]) : new THREE.CatmullRomCurve3(v, false, 'centripetal');
    return new THREE.TubeGeometry(curve, v.length === 2 ? 1 : 28, r, 12, false);
    // `key` stands in for `points`, so a new array with the same values is no change.
  }, [key, r]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} material={mat} />;
}

const add = (a: V3, b: V3, s = 1): V3 => [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s];

// --- The engine --------------------------------------------------------------

/** Cylinder centres along one bank. */
function cylinderZs(count: number, spacing: number, offset: number): number[] {
  return Array.from({ length: count }, (_, i) => offset + (i - (count - 1) / 2) * spacing);
}

function Engine({ spec, layout, m }: { spec: EngineSpec; layout: EngineLayout; m: Mats }) {
  const L = layout;
  const banked = L.banks.length === 2;
  const intakeMod = useRender('intake', 'intake');
  const turboMod = useRender('forced-induction', 'turbo');
  const blowerMod = useRender('forced-induction', 'supercharger');
  const coverMod = useRender('engine-cover', 'engine-cover');

  // Turbos: an aftermarket kit replaces whatever the factory fitted.
  const stockTurbos = spec.aspiration === 'twin-turbo' ? 2 : spec.aspiration === 'turbo' ? 1 : 0;
  const turboCount = turboMod ? turboMod.count : stockTurbos;
  const turboSpots = L.turboSpots.slice(0, turboCount);
  // An inline engine with one spot but two turbos: put them side by side.
  if (turboCount === 2 && turboSpots.length === 1) {
    const s = turboSpots[0];
    turboSpots.splice(0, 1, [s[0], s[1], s[2] - 0.13], [s[0], s[1], s[2] + 0.13]);
  }
  const turboScale = turboMod ? turboMod.inducerMm / 46 : 1; // factory turbos ~46 mm inducer
  const plenumMat = spec.crinkle && banked ? m.cover : m.alloy;

  // Exhaust runners: one per cylinder, gathering at a collector (or a turbo).
  const runners: Array<{ pts: V3[] }> = [];
  L.ports.forEach((port, i) => {
    const count = banked ? L.banks[i].cylinders : spec.cylinders;
    const zs = cylinderZs(count, L.spacing, port.at[2]);
    const sideX = Math.sign(port.at[0]) || 1;
    const turbo = turboSpots.find((t) => Math.sign(t[0]) === sideX);
    // Without a turbo the runners gather a little out from the head and below it.
    const collector: V3 = turbo
      ? [turbo[0] - sideX * 0.07 * turboScale, turbo[1] - 0.04, turbo[2]]
      : [port.at[0] + port.out[0] * 0.12, port.at[1] + port.out[1] * 0.12 - 0.16, port.at[2]];
    for (const z of zs) {
      const start: V3 = [port.at[0], port.at[1], z];
      runners.push({ pts: [start, add(start, port.out, 0.06), collector] });
    }
    // Downpipe away from the collector, out under the car.
    if (!turbo) runners.push({ pts: [collector, add(collector, [0, -0.22, 0])] });
  });

  return (
    <group name="engine">
      {/* Bottom end: crankcase and sump */}
      {spec.layout === 'rotary' ? (
        <>
          <Box at={[0, (L.deck - 0.12) / 2, 0]} size={[L.bankWidth, L.deck + 0.12, L.length - 0.08]} mat={m.block} />
          {/* The stack of rotor housings, each with its own slab */}
          {cylinderZs(spec.cylinders, L.spacing, 0).map((z) => (
            <Box key={z} at={[0, (L.deck - 0.12) / 2, z]} size={[L.bankWidth + 0.03, L.deck + 0.15, L.spacing * 0.8]} mat={m.alloy} />
          ))}
          <Box at={[0, (L.deck - 0.12) / 2, -L.length / 2 + 0.05]} size={[L.bankWidth * 0.9, L.deck + 0.08, 0.06]} mat={m.cover} />
        </>
      ) : (
        <Box
          at={[0, (L.crankcaseTop - 0.05) / 2, 0]}
          size={[L.crankcaseWidth, L.crankcaseTop + 0.05, L.length]}
          mat={m.block}
        />
      )}
      <Box at={[0, (L.sumpY - 0.05) / 2, 0.02]} size={[L.crankcaseWidth * 0.85, -L.sumpY - 0.05, L.length * 0.8]} mat={m.black} />

      {/* Cylinder banks: barrels, head and cam cover, leaning at the bank angle */}
      {L.banks.map((bank, i) => {
        const bankLength = bank.cylinders * L.spacing + 0.07;
        const barrelBase = banked ? L.crankcaseTop * 0.4 : L.deck;
        return (
          <group key={i} position={[0, 0, bank.z]} rotation={[0, 0, bank.tilt]}>
            {banked && (
              <Box at={[0, (barrelBase + L.deck) / 2, 0]} size={[L.bankWidth, L.deck - barrelBase, bankLength]} mat={m.block} />
            )}
            <Box at={[0, L.deck + L.head / 2, 0]} size={[L.bankWidth * 1.02, L.head, bankLength]} mat={m.alloy} />
            <Box at={[0, L.deck + L.head + L.cover / 2, 0]} size={[L.bankWidth * 0.86, L.cover, bankLength * 0.95]} mat={m.cover} />
            {/* Coil packs, one per cylinder */}
            {spec.airCooled
              ? null
              : cylinderZs(bank.cylinders, L.spacing, 0).map((z) => (
                  <Drum key={z} at={[0, L.deck + L.head + L.cover + 0.012, z]} r={0.017} depth={0.03} axis="y" mat={m.black} />
                ))}
          </group>
        );
      })}

      {/* Intake: plenum along the crank, runners into the heads, throttle body */}
      <Drum at={L.plenum.at} r={L.plenum.radius} depth={L.plenum.length} axis="z" mat={spec.layout === 'rotary' ? m.cover : plenumMat} />
      {L.banks.map((bank, i) =>
        cylinderZs(bank.cylinders, L.spacing, bank.z).map((z) => {
          // Into the intake side of the head: -X on an inline, the vee side on V and flat.
          const c = Math.cos(bank.tilt);
          const s = Math.sin(bank.tilt);
          const d = L.deck + L.head * 0.5;
          const x = banked ? -s * d : -L.bankWidth / 2;
          const y = banked ? c * d + (spec.layout === 'flat' ? L.bankWidth * 0.5 : 0) : d;
          const from: V3 = [L.plenum.at[0] + (banked ? Math.sign(x) * L.plenum.radius * 0.6 : L.plenum.radius * 0.7), L.plenum.at[1], z];
          const to: V3 = [banked ? x * 0.62 : x, y, z];
          return <Pipe key={`${i}-${z}`} points={[from, to]} r={0.02} mat={plenumMat} />;
        }),
      )}
      <Drum at={L.throttle} r={0.042} depth={0.06} axis="z" mat={m.alloy} />

      {/* Exhaust manifold */}
      {runners.map((run, i) => (
        <Pipe key={i} points={run.pts} r={0.021} mat={turboSpots.length || turboMod ? m.header : m.iron} />
      ))}

      {/* Accessory drive at the pulley end */}
      <Drum at={L.pulley} r={0.075} depth={0.03} axis="z" mat={m.black} />
      <Drum
        at={banked ? [-0.13, L.crankcaseTop + 0.03, -L.length / 2 + 0.05] : [-(L.bankWidth / 2 + 0.05), L.deck * 0.35, -L.length / 2 + 0.07]}
        r={0.06}
        depth={0.1}
        axis="z"
        mat={m.alloy}
      />

      {/* Gearbox bolted to the other end */}
      {spec.mounting === 'transverse' ? (
        <Drum at={[0, 0.0, L.length / 2 + 0.17]} r={0.16} r2={0.13} depth={0.34} axis="z" mat={m.alloy} />
      ) : (
        <>
          <Drum at={[0, -0.02, L.length / 2 + 0.08]} r={0.19} r2={0.15} depth={0.16} axis="z" mat={m.alloy} />
          <Drum at={[0, -0.04, L.length / 2 + 0.36]} r={0.15} r2={0.09} depth={0.4} axis="z" mat={m.alloy} />
        </>
      )}

      {/* Air-cooled flat-six: shroud over the cylinders and the upright fan */}
      {spec.airCooled && (
        <>
          <Box at={[0, L.crankcaseTop + 0.05, 0]} size={[L.halfWidth * 1.6, 0.1, L.length * 0.9]} mat={m.black} />
          <Drum at={[0, L.crankcaseTop + 0.2, -L.length / 2 + 0.06]} r={0.17} depth={0.1} axis="z" mat={m.black} />
          <Drum at={[0, L.crankcaseTop + 0.2, -L.length / 2 + 0.005]} r={0.07} depth={0.02} axis="z" mat={m.alloy} />
        </>
      )}

      {/* Turbos */}
      {turboSpots.map((at, i) => (
        <Turbo key={i} at={at} side={Math.sign(at[0]) || 1} scale={turboScale} m={m} />
      ))}

      {/* Superchargers */}
      {blowerMod?.style === 'twin-screw' && (
        <group position={L.blowerSpot}>
          <Box at={[0, 0, 0.02]} size={[0.22, 0.15, Math.min(L.length * 0.7, 0.5)]} mat={m.alloy} />
          <Box at={[0, 0.08, 0.02]} size={[0.14, 0.03, Math.min(L.length * 0.6, 0.42)]} mat={m.polished} />
          <Drum at={[0, 0.02, -Math.min(L.length * 0.35, 0.25) - 0.04]} r={0.05} depth={0.08} axis="z" mat={m.black} />
        </group>
      )}
      {blowerMod?.style === 'centrifugal' && <CentrifugalBlower layout={L} banked={banked} m={m} />}

      {/* Carbon cover over the top of the engine, clear of the coil packs */}
      {coverMod && (
        <group name="mod-engine-cover" position={[0, L.top + 0.045, 0]}>
          <Box at={[0, 0, 0]} size={[banked || !L.banks.length ? L.halfWidth * 1.1 : L.bankWidth * 1.15, 0.022, L.length * 0.85]} mat={m.carbon} />
          {/* A raised centre spine, as most covers have */}
          <Box at={[0, 0.016, 0]} size={[0.06, 0.012, L.length * 0.7]} mat={m.carbon} />
        </group>
      )}

      {/* Air intake: the factory airbox, or the aftermarket kit in its place */}
      <Intake throttle={L.throttle} m={m} mod={intakeMod} />
    </group>
  );
}

/** Belt-driven centrifugal blower on the accessory drive, piped to the throttle. */
function CentrifugalBlower({ layout: L, banked, m }: { layout: EngineLayout; banked: boolean; m: Mats }) {
  const at: V3 = [
    banked ? -0.2 : -(L.bankWidth / 2 + 0.14),
    banked ? L.crankcaseTop + 0.08 : L.deck * 0.55,
    -L.length / 2 + 0.1,
  ];
  return (
    <group name="mod-supercharger">
      <Drum at={at} r={0.1} depth={0.08} axis="z" mat={m.alloy} />
      <Drum at={add(at, [0, 0, 0.07])} r={0.06} depth={0.06} axis="z" mat={m.polished} />
      <Pipe points={[add(at, [0.06, 0.08, 0]), add(at, [0.1, 0.2, 0.05]), add(L.throttle, [0, 0.02, -0.04])]} r={0.035} mat={m.polished} />
    </group>
  );
}

function Turbo({ at, side, scale, m }: { at: V3; side: number; scale: number; m: Mats }) {
  return (
    <group position={at} scale={scale}>
      {/* Turbine housing on the exhaust side, compressor beside it on a common shaft */}
      <Drum at={[0, 0, -0.045]} r={0.06} depth={0.06} axis="z" mat={m.iron} />
      <Drum at={[0, 0, 0.01]} r={0.032} depth={0.05} axis="z" mat={m.bronze} />
      <Drum at={[0, 0, 0.065]} r={0.07} depth={0.06} axis="z" mat={m.alloy} />
      <Drum at={[0, 0, 0.12]} r={0.045} depth={0.06} axis="z" mat={m.alloy} />
      {/* Downpipe out of the turbine */}
      <Pipe points={[[side * 0.03, -0.04, -0.07], [side * 0.05, -0.14, -0.1], [side * 0.05, -0.3, -0.12]]} r={0.03} mat={m.header} />
    </group>
  );
}

/** Where the filter sits relative to the throttle body: out to the intake side, toward the pulley end. */
const FILTER_OFFSET: V3 = [-0.17, -0.02, -0.2];

type IntakeRender = Extract<PartRender, { kind: 'intake' }>;

function Intake({ throttle, m, mod }: { throttle: V3; m: Mats; mod: IntakeRender | null }) {
  const filterAt = add(throttle, FILTER_OFFSET);
  const bend: V3 = add(throttle, [-0.02, 0, -0.09]);
  const pipeMat = useMemo(
    () => (mod ? new THREE.MeshStandardMaterial({ color: mod.pipeHex, roughness: mod.style === 'cone' ? 0.25 : 0.32, metalness: mod.style === 'cone' ? 0.8 : 0.15 }) : null),
    [mod],
  );
  const filterMat = useMemo(
    () => (mod ? new THREE.MeshStandardMaterial({ color: mod.filterHex, roughness: 0.85, metalness: 0 }) : null),
    [mod],
  );
  useEffect(() => () => {
    pipeMat?.dispose();
    filterMat?.dispose();
  }, [pipeMat, filterMat]);

  if (!mod || !pipeMat || !filterMat) {
    // Factory: a black plastic airbox and a rubber duct to the throttle body.
    return (
      <group name="airbox">
        <Box at={add(filterAt, [-0.04, 0, -0.02])} size={[0.26, 0.14, 0.22]} mat={m.black} />
        <Pipe points={[throttle, bend, add(filterAt, [0.06, 0, 0.08])]} r={0.04} mat={m.rubber} />
      </group>
    );
  }

  // The cone hangs off the end of the pipe, pointing the way the pipe runs.
  const dir = new THREE.Vector3(...filterAt).sub(new THREE.Vector3(...bend)).normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  const coneLength = mod.style === 'carbon' ? 0.24 : 0.17;
  const coneAt = add(filterAt, [dir.x, dir.y, dir.z], coneLength / 2);
  return (
    <group name="mod-intake">
      <Pipe points={[throttle, bend, filterAt]} r={0.04} mat={pipeMat} />
      <mesh position={coneAt} quaternion={quat} material={mod.style === 'carbon' ? pipeMat : filterMat}>
        <cylinderGeometry args={[mod.style === 'carbon' ? 0.09 : 0.075, 0.045, coneLength, 24]} />
      </mesh>
      {/* Eventuri's housings show the filter through an open mouth */}
      {mod.style === 'carbon' && (
        <mesh position={add(coneAt, [dir.x, dir.y, dir.z], coneLength / 2 + 0.002)} quaternion={quat} material={filterMat}>
          <cylinderGeometry args={[0.078, 0.078, 0.004, 24]} />
        </mesh>
      )}
      {mod.style === 'cone' && (
        <mesh position={add(coneAt, [dir.x, dir.y, dir.z], coneLength / 2)} quaternion={quat} material={m.rubber}>
          <cylinderGeometry args={[0.078, 0.078, 0.012, 24]} />
        </mesh>
      )}
    </group>
  );
}

// --- Bay structure -----------------------------------------------------------

/** Steel bay ahead of the cabin: inner wings, strut towers, firewall, rad support. */
function FrontBay({ bay, m }: { bay: Bay; m: Mats }) {
  const { near, far, halfWidth: hw, floorY, clipY, axleZ } = bay;
  const len = Math.abs(near - far);
  const midZ = (near + far) / 2;
  const wallH = clipY - floorY;
  return (
    <group name="bay-front">
      <Box at={[0, floorY, midZ]} size={[hw * 2, 0.02, len]} mat={m.black} />
      {([-1, 1] as const).map((side) => (
        <group key={side}>
          {/* Inner wing */}
          <Box at={[side * hw, floorY + wallH / 2, midZ]} size={[0.03, wallH, len]} mat={m.painted} />
          {/* Strut tower over the front axle, with its top mount */}
          <Drum at={[side * (hw - 0.07), floorY + wallH * 0.55, axleZ]} r={0.08} r2={0.095} depth={wallH * 0.9} axis="y" mat={m.painted} />
          <Drum at={[side * (hw - 0.07), floorY + wallH, axleZ]} r={0.05} depth={0.03} axis="y" mat={m.black} />
        </group>
      ))}
      {/* Firewall and the scuttle panel on top */}
      <Box at={[0, floorY + wallH / 2, near]} size={[hw * 2, wallH, 0.03]} mat={m.painted} />
      <Box at={[0, clipY - 0.02, near - 0.06]} size={[hw * 2, 0.04, 0.12]} mat={m.black} />
      {/* Radiator support across the nose */}
      <Box at={[0, clipY - 0.04, far + 0.02]} size={[hw * 2, 0.05, 0.05]} mat={m.painted} />
      {/* Brake booster and master cylinder on the driver's side of the firewall */}
      <Drum at={[bay.driverSide * 0.38, clipY - 0.17, near - 0.06]} r={0.11} depth={0.09} axis="z" mat={m.black} />
      <Drum at={[bay.driverSide * 0.38, clipY - 0.15, near - 0.17]} r={0.025} depth={0.14} axis="z" mat={m.alloy} />
      <Box at={[bay.driverSide * 0.38, clipY - 0.11, near - 0.17]} size={[0.07, 0.04, 0.06]} mat={m.reservoir} />
      {/* Battery by the firewall on the passenger side, coolant tank up front */}
      <group position={[-bay.driverSide * (hw - 0.16), clipY - 0.16, near - 0.3]}>
        <Box at={[0, 0, 0]} size={[0.18, 0.17, 0.24]} mat={m.black} />
        <Drum at={[0.05, 0.095, -0.07]} r={0.012} depth={0.02} axis="y" mat={m.red} />
        <Drum at={[0.05, 0.095, 0.07]} r={0.012} depth={0.02} axis="y" mat={m.alloy} />
      </group>
      <Box at={[hw - 0.12, clipY - 0.12, far + 0.24]} size={[0.1, 0.12, 0.14]} mat={m.reservoir} />
    </group>
  );
}

/** Tub behind the cabin for mid- and rear-engined cars. */
function RearBay({ bay, m }: { bay: Bay; m: Mats }) {
  const { near, far, halfWidth: hw, floorY, clipY } = bay;
  const len = Math.abs(far - near);
  const midZ = (near + far) / 2;
  const wallH = clipY - floorY;
  return (
    <group name="bay-rear">
      <Box at={[0, floorY, midZ]} size={[hw * 2, 0.04, len]} mat={m.black} />
      {([-1, 1] as const).map((side) => (
        <Box key={side} at={[side * hw, floorY + wallH / 2, midZ]} size={[0.04, wallH, len]} mat={m.black} />
      ))}
      <Box at={[0, floorY + wallH / 2, near]} size={[hw * 2, wallH, 0.04]} mat={m.black} />
    </group>
  );
}

// --- Strut brace (car space, across the towers) ---------------------------------

type BraceRender = Extract<PartRender, { kind: 'strut-brace' }>;

/**
 * A bar between the tops of the strut towers. On a real car the towers stand
 * higher than the engine; here the bay is cut lower, so the bar rides on
 * risers high enough to clear whatever engine is fitted.
 */
function StrutBrace({ bay, spec }: { bay: Bay; spec: BraceRender }) {
  const bar = useMemo(() => new THREE.MeshStandardMaterial({ color: spec.barHex, roughness: 0.3, metalness: 0.85 }), [spec]);
  const plate = useMemo(() => new THREE.MeshStandardMaterial({ color: spec.plateHex, roughness: 0.4, metalness: 0.6 }), [spec]);
  useEffect(() => () => {
    bar.dispose();
    plate.dispose();
  }, [bar, plate]);

  const towerX = bay.end === 'front' ? bay.halfWidth - 0.07 : bay.halfWidth - 0.05;
  const towerY = bay.clipY;
  const engineTop = bay.center[1] + bay.layout.top + 0.04;
  const barY = Math.max(towerY + 0.03, engineTop + 0.03);
  const z = bay.axleZ;
  const ends = ([-1, 1] as const).map((side) => [side * (towerX - 0.06), barY, z] as V3);
  // Third leg: back to a post on the firewall (or bulkhead) top.
  const wallZ = bay.near - Math.sign(bay.near - z) * 0.05;
  const node: V3 = [0, barY - 0.01, wallZ];
  return (
    <group name="mod-strut-brace">
      {([-1, 1] as const).map((side, i) => (
        <group key={side}>
          {/* Tower plate and riser up to the bar */}
          <Box at={[side * towerX, towerY + 0.005, z]} size={[0.13, 0.01, 0.13]} mat={plate} />
          <Pipe points={[[side * towerX, towerY + 0.01, z], ends[i]]} r={0.016} mat={plate} />
          {spec.legs === 3 && <Pipe points={[ends[i], node]} r={0.014} mat={bar} />}
        </group>
      ))}
      <Pipe points={ends} r={0.019} mat={bar} />
      {spec.legs === 3 && (
        <>
          <Pipe points={[[0, towerY, wallZ], node]} r={0.016} mat={plate} />
          <Box at={[0, towerY + 0.005, wallZ]} size={[0.16, 0.01, 0.08]} mat={plate} />
        </>
      )}
    </group>
  );
}

// --- Cooling parts (in car space, at the nose) --------------------------------

function Cooling({ car, bay, m }: { car: CarDef; bay: Bay; m: Mats }) {
  const radiator = useRender('cooling', 'radiator');
  const intercooler = useRender('cooling', 'intercooler');
  const turboMod = useRender('forced-induction', 'turbo');
  const e = car.engine;
  const front = bay.end === 'front';
  // Rear- and mid-engined cars still carry their radiators in the nose.
  const noseZ = front ? bay.far + 0.07 : bodyEnds(car).nose + 0.3;
  const coreY = front ? (bay.floorY + bay.clipY) / 2 : 0.42;
  const coreH = front ? (bay.clipY - bay.floorY) * 0.75 : 0.36;
  const coreW = front ? bay.halfWidth * 1.5 : car.sizeM.width * 0.55;
  const throttle = toCar(bay.layout.throttle, bay.center, bay.yaw);

  const children: ReactNode[] = [];
  if (!e.airCooled && (front || radiator)) {
    const thick = radiator ? 0.055 : 0.035;
    children.push(
      <group key="radiator" name={radiator ? 'mod-radiator' : 'radiator'} position={[0, coreY, noseZ]}>
        <Box at={[0, 0, 0]} size={[coreW, coreH, thick]} mat={radiator ? m.alloy : m.black} />
        {/* End tanks: polished alloy on the aftermarket core, black plastic on the factory one */}
        {([-1, 1] as const).map((side) => (
          <Box key={side} at={[side * (coreW / 2 + 0.03), 0, 0]} size={[0.06, coreH + 0.02, thick + 0.01]} mat={radiator ? m.polished : m.black} />
        ))}
      </group>,
    );
  }
  if (intercooler) {
    if (front) {
      // Front-mount core low in the bumper, ahead of the radiator, piped to the
      // turbo on one side and the throttle on the other.
      const icZ = bay.far + 0.0;
      const icY = bay.center[1] - 0.06;
      const icW = bay.halfWidth * 1.75;
      const spots = bay.layout.turboSpots.slice(0, turboMod ? turboMod.count : e.aspiration === 'na' ? 0 : 1);
      const hot = spots.length ? toCar(spots[0], bay.center, bay.yaw) : null;
      children.push(
        <group key="fmic" name="mod-intercooler">
          <Box at={[0, icY, icZ]} size={[icW, 0.2, 0.07]} mat={m.alloy} />
          <Box at={[0, icY, icZ - 0.036]} size={[icW * 0.9, 0.17, 0.004]} mat={m.black} />
          <Pipe points={[[icW / 2, icY, icZ], [icW / 2 + 0.02, icY + 0.1, icZ + 0.2], add(throttle, [0, 0.04, 0])]} r={0.032} mat={m.polished} />
          {hot && <Pipe points={[[-icW / 2, icY, icZ], [-icW / 2 - 0.02, icY + 0.05, icZ + 0.2], hot]} r={0.032} mat={m.polished} />}
        </group>,
      );
    } else {
      // Behind the cabin there is no bumper to hide it in: a core over the engine.
      const at = toCar([0, bay.layout.top + 0.07, 0.05], bay.center, bay.yaw);
      children.push(
        <group key="ric" name="mod-intercooler" position={at} rotation={[-0.12, bay.yaw, 0]}>
          <Box at={[0, 0, 0]} size={[0.6, 0.06, 0.3]} mat={m.alloy} />
          <Box at={[0, 0.032, 0]} size={[0.55, 0.004, 0.26]} mat={m.black} />
        </group>,
      );
    }
  }
  return <>{children}</>;
}

// --- Everything together -------------------------------------------------------

export function EngineBay({ car }: { car: CarDef }) {
  const bay = useMemo(() => bayFor(car), [car]);
  const m = useBayMaterials(car.engine);
  // The bay panels only matter with the bonnet off. Outside the engine view
  // they would poke through an outline car's see-through body.
  const open = useGarage((s) => s.view === 'engine');
  const brace = useRender('strut-brace', 'strut-brace');
  if (!bay) return null;
  return (
    <group name="engine-bay">
      {open && (bay.end === 'front' ? <FrontBay bay={bay} m={m} /> : <RearBay bay={bay} m={m} />)}
      <group position={bay.center} rotation={[0, bay.yaw, 0]}>
        <Engine spec={car.engine} layout={bay.layout} m={m} />
      </group>
      <Cooling car={car} bay={bay} m={m} />
      {brace && <StrutBrace bay={bay} spec={brace} />}
    </group>
  );
}
