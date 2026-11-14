import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { paintFinish } from '../data/paint';
import type { CarDef } from '../data/types';
import { useGarage, useSelection } from '../state/garage';
import { AxleAssembly } from './Corners';
import { Lift } from './Lift';
import { axleSetup, bodyDeltaAt, bodyPose, type AxleMount } from './stance';

/** Reads the wheel attachment points out of the model. */
function readMounts(scene: THREE.Object3D, car: CarDef): { front: AxleMount; rear: AxleMount } {
  const find = (name: string) => {
    const node = scene.getObjectByName(name);
    if (!node) throw new Error(`Model is missing attachment point "${name}"`);
    return node.position;
  };
  const fl = find(car.nodes.mounts.fl);
  const rl = find(car.nodes.mounts.rl);
  return {
    front: { halfTrack: Math.abs(fl.x), y: fl.y, z: fl.z },
    rear: { halfTrack: Math.abs(rl.x), y: rl.y, z: rl.z },
  };
}

export function Car() {
  const { car, wheel, wheelFinish, fitment } = useSelection();
  const view = useGarage((s) => s.view);
  const paintHex = useGarage((s) => s.paintHex);
  const finishId = useGarage((s) => s.paintFinish);
  const rideFrontMm = useGarage((s) => s.rideFrontMm);
  const rideRearMm = useGarage((s) => s.rideRearMm);
  const tint = useGarage((s) => s.tint);
  const caliperColorId = useGarage((s) => s.caliperColorId);
  const leatherId = useGarage((s) => s.leatherId);

  const { scene } = useGLTF(car.modelUrl);
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
    const assign = (names: string[], material: THREE.Material) => {
      for (const name of names) {
        const mesh = scene.getObjectByName(name);
        if (mesh instanceof THREE.Mesh) mesh.material = material;
        else console.warn(`Model has no mesh named "${name}"`);
      }
    };
    assign(car.nodes.paint, paint);
    assign(car.nodes.glass, glass);
    assign(car.nodes.leather, leather);
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

  // --- Stance ----------------------------------------------------------------
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

  return (
    <Lift
      raised={raised}
      spec={car.lift}
      contactY={car.lift.contactM + bodyDeltaAt(pose, car.lift.runnerZ)}
    >
      <group ref={body} name="body">
        <primitive object={scene} />
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
          brake={car.brakes[axle]}
          caliperColor={caliperColor}
        />
      ))}
    </Lift>
  );
}
