import { Lightbulb, ToggleLeft } from 'lucide-react';
import { useWidget, useAction } from '../../hooks/useWidget.js';

export default function LightRow() {
  const lights = useWidget('lights', '/api/lights', 30);
  const switches = useWidget('switches', '/api/switches', 30);
  const { act, isActing } = useAction(['lights', 'switches']);

  const lightItems = (lights.data?.items || []).map((l) => ({ ...l, domain: 'light' }));
  const switchItems = (switches.data?.items || []).map((s) => ({ ...s, domain: 'switch' }));
  const tiles = [...lightItems, ...switchItems];

  if (lights.isLoading && switches.isLoading) {
    return (
      <div className="light-row">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="shimmer light-tile" />
        ))}
      </div>
    );
  }

  if (!tiles.length) return null;

  return (
    <div className="light-row">
      {tiles.map((t) => {
        const on = t.state === 'on';
        const unavailable = t.state === 'unavailable';
        const path = t.domain === 'light' ? '/api/lights' : '/api/switches';
        const sublabel =
          t.domain === 'light' && on && t.brightness != null
            ? `On · ${Math.round((t.brightness / 255) * 100)}%`
            : undefined;
        return (
          <button
            key={t.entity_id}
            type="button"
            disabled={unavailable || isActing}
            onClick={() => act(`${path}/${t.entity_id}`, { action: 'toggle' })}
            className={`light-tile ${on ? 'light-tile-on' : ''} ${unavailable ? 'light-tile-unavailable' : ''}`}
          >
            {t.domain === 'light' ? <Lightbulb size={22} /> : <ToggleLeft size={22} />}
            <span className="light-tile-name">{t.name}</span>
            <span className="light-tile-state">
              {unavailable ? 'unavailable' : isActing ? '…' : sublabel || (on ? 'On' : 'Off')}
            </span>
          </button>
        );
      })}
    </div>
  );
}
