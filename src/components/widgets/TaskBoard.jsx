import { Check } from 'lucide-react';
import { format, formatDistanceToNowStrict, isToday, parseISO } from 'date-fns';
import { useWidget, useToggleTodo } from '../../hooks/useWidget.js';
import { groupByPriority, sortByPriority, PRIORITY_COLORS } from '../../lib/todos.js';

function TaskCard({ todo, onTap }) {
  const dueToday = todo.due && isToday(parseISO(todo.due));
  return (
    <button
      type="button"
      className={`task-card ${todo.done ? 'task-card-done' : ''}`}
      style={{ border: 'none', width: '100%', textAlign: 'left' }}
      onClick={() => onTap(todo)}
    >
      <span className={`task-check ${todo.done ? 'task-check-done' : ''}`}>
        {todo.done && <Check size={15} />}
      </span>
      <span className="task-card-body">
        <span className={`task-card-title ${todo.done ? 'task-card-title-done' : ''}`}>{todo.title}</span>
        <span className="task-card-meta">
          {todo.due && (
            <span className={`task-due-pill ${dueToday ? 'task-due-pill-today' : ''}`}>
              {dueToday ? 'Today' : format(parseISO(todo.due), 'd MMM')}
            </span>
          )}
          {todo.project && <span className="task-project">{todo.project}</span>}
        </span>
      </span>
    </button>
  );
}

function TaskColumn({ name, color, items, onTap }) {
  const open = items.filter((t) => !t.done).length;
  return (
    <div className="card card-enter tasks-column">
      <div className="tasks-column-header">
        <span className="tasks-column-dot" style={{ background: color }} />
        <span className="tasks-column-name">{name}</span>
        <span className="tasks-column-count">{open}</span>
      </div>
      <div className="tasks-column-list">
        {sortByPriority(items).map((t) => (
          <TaskCard key={t.id} todo={t} onTap={onTap} />
        ))}
        {items.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--fg3)', fontSize: 12, padding: '12px 0' }}>Nothing here</div>
        )}
      </div>
    </div>
  );
}

export default function TaskBoard() {
  const { data, error, lastUpdated } = useWidget('todos', '/api/todos', 300);
  const toggle = useToggleTodo();

  if (error) {
    return (
      <div className="card card-enter" style={{ padding: 20, textAlign: 'center', color: 'var(--warn)' }}>
        {error}
      </div>
    );
  }

  if (!data) {
    return <div className="shimmer" style={{ height: '100%', borderRadius: 'var(--r)' }} />;
  }

  const items = data.items || [];
  const done = items.filter((t) => t.done).length;
  const total = items.length;
  const open = total - done;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const groups = groupByPriority(items);

  return (
    <div className="tasks-page">
      <div className="card card-enter tasks-summary">
        <span className="tasks-summary-title">{open} open tasks</span>
        <div className="tasks-summary-track">
          <div className="tasks-summary-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="tasks-summary-count">{done} / {total} done</span>
        <span className="tasks-summary-source">
          Notion · synced {lastUpdated ? formatDistanceToNowStrict(new Date(lastUpdated), { addSuffix: true }) : '—'}
        </span>
      </div>

      <div className="tasks-columns">
        <TaskColumn name="High" color={PRIORITY_COLORS.High} items={groups.High} onTap={toggle} />
        <TaskColumn name="Medium" color={PRIORITY_COLORS.Medium} items={groups.Medium} onTap={toggle} />
        <TaskColumn name="Low" color={PRIORITY_COLORS.Low} items={groups.Low} onTap={toggle} />
      </div>
    </div>
  );
}
