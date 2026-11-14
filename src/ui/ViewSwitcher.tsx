import { useGarage } from '../state/garage';

export function ViewSwitcher() {
  const views = useGarage((s) => s.car.views);
  const current = useGarage((s) => s.view);
  const setView = useGarage((s) => s.setView);

  return (
    <nav className="views" aria-label="Camera view">
      {views.map((view, index) => (
        <button
          key={view.id}
          type="button"
          className="view"
          aria-pressed={view.id === current}
          title={`${view.name} (press ${index + 1})`}
          onClick={() => setView(view.id)}
        >
          {view.name}
        </button>
      ))}
    </nav>
  );
}
