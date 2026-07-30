import { Lightbulb, ToggleLeft, AlertTriangle } from 'lucide-react';
import ToggleTile from './ToggleTile.jsx';
import { useWidget, useAction } from '../../hooks/useWidget.js';

export default function HomeControlsWidget() {
  const lights = useWidget('lights', '/api/lights', 30);
  const switches = useWidget('switches', '/api/switches', 30);
  const { act, isActing } = useAction(['lights', 'switches']);

  const lightItems = (lights.data?.items || []).map((l) => ({ ...l, domain: 'light' }));
  const switchItems = (switches.data?.items || []).map((s) => ({ ...s, domain: 'switch' }));
  const tiles = [...lightItems, ...switchItems];

  if (lights.error && switches.error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-[var(--accent-red)]">
        <AlertTriangle size={28} />
        <span className="text-sm text-[var(--text-secondary)]">{lights.error}</span>
      </div>
    );
  }

  if (lights.isLoading && switches.isLoading) {
    return (
      <div className="toggle-grid">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="shimmer h-full w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!tiles.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-[var(--text-muted)]">
        <Lightbulb size={28} />
        <span className="text-sm">No controllable lights or switches configured</span>
      </div>
    );
  }

  return (
    <div className="toggle-grid">
      {tiles.map((t) => {
        const on = t.state === 'on';
        const unavailable = t.state === 'unavailable';
        const path = t.domain === 'light' ? '/api/lights' : '/api/switches';
        return (
          <ToggleTile
            key={t.entity_id}
            icon={t.domain === 'light' ? <Lightbulb size={26} /> : <ToggleLeft size={26} />}
            name={t.name}
            sublabel={
              t.domain === 'light' && on && t.brightness != null
                ? `On · ${Math.round((t.brightness / 255) * 100)}%`
                : undefined
            }
            on={on}
            unavailable={unavailable}
            busy={isActing}
            accent={t.domain === 'light' ? 'var(--accent-amber)' : 'var(--accent-teal)'}
            onTap={() => act(`${path}/${t.entity_id}`, { action: 'toggle' })}
          />
        );
      })}
    </div>
  );
}
