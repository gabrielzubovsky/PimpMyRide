import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { paintFinish } from '../data/paint';
import type { CarDef } from '../data/types';
import { tyreOuterRadius } from '../parts/tyre';
import { MM } from '../units';
import { useGarage, useSelection } from '../state/garage';
import { AxleAssembly } from './Corners';
import { Lift } from './Lift';
import { BodyMods, CoiloverMod, useRender } from './Mods';
import { axleSetup, bodyDeltaAt, bodyPose, type AxleMount } from './stance';

export function Car() {
  const car = useGarage((s) => s.car);
  // Key by car so a car change rebuilds the scene graph from scratch.
  return car.modelUrl ? <ModelCar key={car.id} /> : <OutlineCar key={car.id} />;
}

// --- Shared chassis: stance, lift and the four corners ----------------------

interface Mounts {
  front: AxleMount;
  rear: AxleMount;
}

/** Everything below the body: stance maths, the lift, wheels and brakes. */
function Chassis({ mounts, children }: { mounts: Mounts; children: ReactNode }) {
  const { car, wheel, wheelFinish, fitment } = useSelection();
  const view = useGarage((s) => s.view);
  const rideFrontMm = useGarage((s) => s.rideFrontMm);
  const rideRearMm = useGarage((s) => s.rideRearMm);
  const caliperColorId = useGarage((s) => s.caliperColorId);

  const front = axleSetup(car, mounts.front, fitment.front, 'front', rideFrontMm);
  const rear = axleSetup(car, mounts.rear, fitment.rear, 'rear', rideRearMm);
  const pose = bodyPose(front, rear);

  // Ease the body toward its new height so the sliders feel like suspension.
  const body = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!body.current) return;
    body.current.position.y = THREE.MathUtils.damp(body.current.position.y, pose.y, 9, delta);
    body.current.rotation.x = THREE.MathUtils.damp(body.current.rotation.x, pose.pitch, 9, delta);
  });

  const caliperColor = car.caliperColors.find((c) => c.id === caliperColorId)?.hex ?? '#f0c400';
  const raised = car.views.find((v) => v.id === view)?.lift ?? false;

  // A big-brake kit swaps the discs and calipers; the caliper side stays put.
  const brakeKit = useRender('brake-kit', 'brakes');
  const brakeFor = (axle: 'front' | 'rear') =>
    brakeKit ? { ...car.brakes[axle], ...brakeKit[axle] } : car.brakes[axle];

  return (
    <Lift
      raised={raised}
      spec={car.lift}
      contactY={car.lift.contactM + bodyDeltaAt(pose, car.lift.runnerZ)}
    >
      <group ref={body} name="body">
        {children}
      </group>
      {(['front', 'rear'] as const).map((axle) => (
        <AxleAssembly
          key={axle}
          axle={axle}
          setup={axle === 'front' ? front : rear}
          wheel={{
            diameterIn: fitment[axle].diameterIn,
            widthIn: fitment[axle].widthIn,
            offsetMm: fitment[axle].offsetMm,
            boltCount: car.boltCount,
            pcdMm: car.pcdMm,
            design: wheel.design,
          }}
          tyre={fitment[axle].tyre}
          finish={wheelFinish}
          brake={brakeFor(axle)}
          caliperColor={caliperColor}
        />
      ))}
      {(['front', 'rear'] as const).map((axle) =>
        ([1, -1] as const).map((side) => (
          <CoiloverMod key={`${axle}${side}`} setup={axle === 'front' ? front : rear} side={side} />
        )),
      )}
    </Lift>
  );
}

// --- A car with a real model ------------------------------------------------

/** Reads the wheel attachment points out of the model. */
function readMounts(scene: THREE.Object3D, car: CarDef): Mounts {
  const nodes = car.nodes;
  if (!nodes) throw new Error(`Car "${car.id}" has a model but no node names`);
  const find = (name: string) => {
    const node = scene.getObjectByName(name);
    if (!node) throw new Error(`Model is missing attachment point "${name}"`);
    return node.position;
  };
  const fl = find(nodes.mounts.fl);
  const rl = find(nodes.mounts.rl);
  return {
    front: { halfTrack: Math.abs(fl.x), y: fl.y, z: fl.z },
    rear: { halfTrack: Math.abs(rl.x), y: rl.y, z: rl.z },
  };
}

function ModelCar() {
  const car = useGarage((s) => s.car);
  const paintHex = useGarage((s) => s.paintHex);
  const finishId = useGarage((s) => s.paintFinish);
  const tint = useGarage((s) => s.tint);
  const leatherId = useGarage((s) => s.leatherId);

  const { scene } = useGLTF(car.modelUrl as string);
  const mounts = useMemo(() => readMounts(scene, car), [scene, car]);

  // --- Materials we control from the build -----------------------------------
  const paint = useMemo(() => new THREE.MeshPhysicalMaterial({ name: 'paint' }), []);
  const glass = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        name: 'glass',
        color: '#0a0c0e',
        metalness: 0.2,
        roughness: 0.02,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [],
  );
  const leather = useMemo(
    () => new THREE.MeshStandardMaterial({ name: 'leather', metalness: 0, roughness: 0.62 }),
    [],
  );
  useEffect(
    () => () => {
      paint.dispose();
      glass.dispose();
      leather.dispose();
    },
    [paint, glass, leather],
  );

  // Swap our materials onto the meshes named in the car's data.
  useLayoutEffect(() => {
    const nodes = car.nodes;
    if (!nodes) return;
    const assign = (names: string[], material: THREE.Material) => {
      for (const name of names) {
        const mesh = scene.getObjectByName(name);
        if (mesh instanceof THREE.Mesh) mesh.material = material;
        else console.warn(`Model has no mesh named "${name}"`);
      }
    };
    assign(nodes.paint, paint);
    assign(nodes.glass, glass);
    assign(nodes.leather, leather);
  }, [scene, car, paint, glass, leather]);

  useLayoutEffect(() => {
    const finish = paintFinish(finishId);
    paint.color.set(paintHex);
    paint.metalness = finish.metalness;
    paint.roughness = finish.roughness;
    paint.clearcoat = finish.clearcoat;
    paint.clearcoatRoughness = finish.clearcoatRoughness;
  }, [paint, paintHex, finishId]);

  useLayoutEffect(() => {
    glass.opacity = THREE.MathUtils.lerp(0.18, 0.94, tint);
  }, [glass, tint]);

  useLayoutEffect(() => {
    leather.color.set(car.leatherColors.find((c) => c.id === leatherId)?.hex ?? '#131313');
  }, [leather, car, leatherId]);

  // Swap out the factory steering wheel when an aftermarket one is fitted.
  const aftermarketWheel = useRender('steering', 'steering');
  useLayoutEffect(() => {
    const name = car.nodes?.steering;
    if (!name) return;
    const node = scene.getObjectByName(name);
    if (node) node.visible = !aftermarketWheel;
  }, [scene, car, aftermarketWheel]);

  return (
    <Chassis mounts={mounts}>
      <primitive object={scene} />
      <BodyMods car={car} mounts={mounts} />
    </Chassis>
  );
}

// --- A car that has no model yet --------------------------------------------

// Until a model is sourced the car is a translucent outline: two soft boxes
// sized from the car's real dimensions, so proportions, stance and wheels can
// still be judged. The wheels, tyres and brakes are the real generators.

/** Fake the attachment points from the published track and wheelbase. */
function specMounts(car: CarDef): Mounts {
  const stock = car.fitments[0];
  const mount = (axle: 'front' | 'rear', halfTrack: number, z: number): AxleMount => {
    const f = stock[axle];
    return {
      halfTrack,
      // Factory axle height: the stock tyre's loaded radius. This makes the
      // outline sit exactly at stock ride height before any changes.
      y: tyreOuterRadius({ ...f.tyre, rimDiameterIn: f.diameterIn }) - 3 * MM,
      z,
    };
  };
  return {
    front: mount('front', car.sizeM.trackFront / 2, -car.sizeM.wheelbase / 2),
    rear: mount('rear', car.sizeM.trackRear / 2, car.sizeM.wheelbase / 2),
  };
}

function OutlineCar() {
  const car = useGarage((s) => s.car);
  const paintHex = useGarage((s) => s.paintHex);
  const finishId = useGarage((s) => s.paintFinish);
  const tint = useGarage((s) => s.tint);

  const mounts = useMemo(() => specMounts(car), [car]);
  const { length: l, width: w, height: h } = car.sizeM;

  const body = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        name: 'outline-body',
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
      }),
    [],
  );
  const cabin = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        name: 'outline-cabin',
        color: '#0a0c0e',
        metalness: 0.2,
        roughness: 0.05,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );
  useEffect(
    () => () => {
      body.dispose();
      cabin.dispose();
    },
    [body, cabin],
  );

  useLayoutEffect(() => {
    const finish = paintFinish(finishId);
    body.color.set(paintHex);
    body.metalness = finish.metalness;
    body.roughness = finish.roughness;
  }, [body, paintHex, finishId]);

  useLayoutEffect(() => {
    cabin.opacity = THREE.MathUtils.lerp(0.15, 0.5, tint);
  }, [cabin, tint]);

  return (
    <Chassis mounts={mounts}>
      {/* Lower body */}
      <mesh material={body} position={[0, h * 0.33, 0]}>
        <boxGeometry args={[w * 0.94, h * 0.4, l * 0.97]} />
      </mesh>
      {/* Greenhouse */}
      <mesh material={cabin} position={[0, h * 0.67, l * 0.02]}>
        <boxGeometry args={[w * 0.8, h * 0.32, l * 0.45]} />
      </mesh>
      <BodyMods car={car} mounts={mounts} />
    </Chassis>
  );
}
