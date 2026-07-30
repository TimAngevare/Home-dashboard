export default function ToggleTile({ icon, name, sublabel, on, unavailable, busy, onTap, accent = 'var(--accent-amber)' }) {
  return (
    <button
      type="button"
      disabled={unavailable || busy}
      onClick={onTap}
      className={`toggle-tile ${on ? 'toggle-tile-on' : ''} ${unavailable ? 'toggle-tile-unavailable' : ''}`}
      style={on ? { '--tile-accent': accent } : undefined}
    >
      <span className="toggle-tile-icon">{icon}</span>
      <span className="toggle-tile-name">{name}</span>
      <span className="toggle-tile-state">
        {unavailable ? 'unavailable' : busy ? '…' : sublabel || (on ? 'On' : 'Off')}
      </span>
    </button>
  );
}
