import { useProgress } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { Suspense, useEffect } from 'react';
import { CameraRig } from './scene/CameraRig';
import { Car } from './scene/Car';
import { Garage } from './scene/Garage';
import { useGarage } from './state/garage';
import { BuildSheet } from './ui/BuildSheet';
import { ViewSwitcher } from './ui/ViewSwitcher';
import { ModelCredit } from './ui/ModelCredit';

export function App() {
  const car = useGarage((s) => s.car);
  const view = useGarage((s) => s.view);
  const setView = useGarage((s) => s.setView);

  // Number keys 1 to 4 jump between the shop views.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const typing = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement;
      if (typing || event.metaKey || event.ctrlKey || event.altKey) return;
      const next = car.views[Number(event.key) - 1];
      if (next) setView(next.id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [car, setView]);

  const current = car.views.find((v) => v.id === view);

  return (
    <div className="app">
      <main className="stage">
        <Canvas
          dpr={[1, 2]}
          camera={{ position: car.views[0].position, fov: car.views[0].fov, near: 0.03, far: 80 }}
          gl={{ antialias: true, localClippingEnabled: true }}
        >
          <Garage />
          <Suspense fallback={null}>
            <Car />
          </Suspense>
          <CameraRig />
          {import.meta.env.DEV && <DevHandle />}
        </Canvas>

        <header className="masthead">
          <p className="wordmark">Pimp My Ride</p>
          <p className="masthead-car">
            {car.make} {car.model}
          </p>
          {car.modelCredit && (
            <p className="masthead-credit">
              <ModelCredit credit={car.modelCredit} />
            </p>
          )}
        </header>

        <LoadingNote />

        <p className="hint">
          {current?.note ??
            (current?.lookAround
              ? 'Drag to look around the cabin. Scroll to zoom.'
              : 'Drag to move around the car. Scroll to zoom.')}
        </p>

        <ViewSwitcher />
      </main>

      <BuildSheet />
    </div>
  );
}

/** While developing, `three()` in the browser console returns the live scene, camera and controls. */
function DevHandle() {
  const get = useThree((s) => s.get);
  useEffect(() => {
    (window as unknown as { three: typeof get }).three = get;
  }, [get]);
  return null;
}

function LoadingNote() {
  const { active, progress } = useProgress();
  if (!active) return null;
  return (
    <p className="loading" role="status">
      Rolling the car in, {Math.round(progress)}%
    </p>
  );
}
