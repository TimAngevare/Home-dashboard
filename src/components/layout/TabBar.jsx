import { Home, Music4, CalendarDays, CheckSquare, Cpu } from 'lucide-react';

export const TABS = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'media', label: 'Media', Icon: Music4 },
  { id: 'agenda', label: 'Agenda', Icon: CalendarDays },
  { id: 'todos', label: 'Todos', Icon: CheckSquare },
  { id: 'system', label: 'System', Icon: Cpu },
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
          <Icon size={22} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
