import { CameraControls, CameraControlsImpl } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGarage } from '../state/garage';

// Shop-style camera. Each view in the car's data is a preset: where the camera
// stands, what it looks at, and how far it may move. Switching view glides the
// camera from one preset to the next.

const { ACTION } = CameraControlsImpl;
const DEG = Math.PI / 180;
const LOOK_AROUND_REACH = 0.05; // metres between the eye and its pivot in look-around views
const COMFORTABLE_ASPECT = 1.35; // presets are framed for a view at least this wide

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function CameraRig() {
  const controls = useRef<CameraControlsImpl>(null);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const get = useThree((s) => s.get);
  const car = useGarage((s) => s.car);
  const viewId = useGarage((s) => s.view);
  const view = car.views.find((v) => v.id === viewId) ?? car.views[0];
  const firstMove = useRef(true);

  // An unseen slab just above the floor. The controls treat it as solid, so
  // the camera cannot sink below the ground when looking up at the car.
  const floorCollider = useMemo(() => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(80, 1, 80));
    mesh.position.y = -0.38;
    mesh.updateMatrixWorld();
    return mesh;
  }, []);

  useEffect(() => {
    const c = controls.current;
    if (!c) return;

    const position = new THREE.Vector3(...view.position);
    const target = new THREE.Vector3(...view.target);
    if (view.lookAround) {
      // Orbiting a pivot a few centimetres ahead of the eye feels like turning
      // your head on the spot.
      target.sub(position).setLength(LOOK_AROUND_REACH).add(position);
    }

    // On a tall, narrow screen the car would be cropped at the sides, so stand
    // further back.
    const { width, height } = get().size;
    const stepBack = view.lookAround ? 1 : Math.max(1, COMFORTABLE_ASPECT / (width / height));
    position.sub(target).multiplyScalar(stepBack).add(target);

    c.minDistance = view.minDistance;
    c.maxDistance = view.maxDistance * stepBack;
    c.minPolarAngle = view.minPolar * DEG;
    c.maxPolarAngle = view.maxPolar * DEG;
    // In a look-around view, drag moves the scene with the pointer and the
    // wheel zooms the lens rather than moving the camera.
    c.azimuthRotateSpeed = view.lookAround ? -0.35 : 1;
    c.polarRotateSpeed = view.lookAround ? -0.35 : 1;
    c.mouseButtons.wheel = view.lookAround ? ACTION.ZOOM : ACTION.DOLLY;
    c.touches.two = view.lookAround ? ACTION.TOUCH_ZOOM : ACTION.TOUCH_DOLLY;
    c.minZoom = 1;
    c.maxZoom = view.lookAround ? 2.2 : 1;

    const animate = !firstMove.current && !reducedMotion();
    firstMove.current = false;
    c.smoothTime = 0.55;
    void c.zoomTo(1, animate);
    void c.setLookAt(position.x, position.y, position.z, target.x, target.y, target.z, animate);
  }, [view, get]);

  // Ease the lens between views too: wide inside the cabin, longer outside.
  useFrame((_, delta) => {
    if (Math.abs(camera.fov - view.fov) < 0.01) return;
    camera.fov = reducedMotion() ? view.fov : THREE.MathUtils.damp(camera.fov, view.fov, 5, delta);
    camera.updateProjectionMatrix();
  });

  return (
    <CameraControls
      ref={controls}
      makeDefault
      colliderMeshes={[floorCollider]}
      truckSpeed={0}
      draggingSmoothTime={0.12}
      mouseButtons-right={ACTION.NONE}
      mouseButtons-middle={ACTION.NONE}
      touches-three={ACTION.NONE}
    />
  );
}
