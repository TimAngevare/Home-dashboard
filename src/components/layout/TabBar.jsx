import { House, Music4, CalendarDays, ListChecks, Gauge } from 'lucide-react';

export const TABS = [
  { id: 'home', label: 'Home', Icon: House },
  { id: 'music', label: 'Music', Icon: Music4 },
  { id: 'agenda', label: 'Agenda', Icon: CalendarDays },
  { id: 'tasks', label: 'Tasks', Icon: ListChecks },
  { id: 'system', label: 'System', Icon: Gauge },
];

export default function TabBar({ active, onChange }) {
  return (
    <nav className="tab-bar">
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className={`tab-btn ${active === id ? 'tab-btn-active' : ''}`}
          onClick={() => onChange(id)}
        >
          <Icon size={23} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
