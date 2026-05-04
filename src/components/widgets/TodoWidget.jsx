import { CheckSquare, Square } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import GlassCard from '../layout/GlassCard.jsx';
import { useWidget } from '../../hooks/useWidget.js';

export default function TodoWidget({ index }) {
  const { data, isLoading, error, lastUpdated, refreshInterval } = useWidget(
    'todos',
    '/api/todos',
    300,
  );
  const status = error ? 'error' : isLoading ? 'loading' : 'ok';
  const items = data?.items || [];
  const visible = items.slice(0, 10);
  const overflow = items.length - visible.length;

  return (
    <GlassCard
      title="Todos"
      icon={<CheckSquare size={16} className="text-[var(--accent-blue)]" />}
      refreshInterval={refreshInterval}
      lastUpdated={lastUpdated}
      status={status}
      error={error}
      index={index}
      bodyClassName="overflow-y-auto"
    >
      {data ? (
        items.length === 0 ? (
          <Empty />
        ) : (
          <div className="flex flex-col gap-1.5">
            {visible.map((t) => (
              <TodoRow key={t.id} todo={t} />
            ))}
            {overflow > 0 && (
              <div className="text-[10px] text-[var(--text-muted)] text-center pt-1">
                +{overflow} more
              </div>
            )}
          </div>
        )
      ) : (
        <Skeleton />
      )}
    </GlassCard>
  );
}

function TodoRow({ todo }) {
  const Icon = todo.done ? CheckSquare : Square;
  return (
    <div className={`flex items-start gap-2 ${todo.done ? 'opacity-50' : ''}`}>
      <Icon size={14} className="mt-0.5 text-[var(--text-muted)] shrink-0" />
      <div className="flex-1 min-w-0">
        <div className={`text-xs text-[var(--text-primary)] truncate ${todo.done ? 'line-through' : ''}`}>
          {todo.title}
        </div>
        {(todo.priority || todo.due) && (
          <div className="flex items-center gap-2 mt-0.5">
            {todo.priority && (
              <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: todo.priorityColor || '#9b6dff' }}
                />
                {todo.priority}
              </span>
            )}
            {todo.due && (
              <span className="font-mono text-[10px] text-[var(--text-muted)]">
                {format(parseISO(todo.due), 'd MMM')}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Empty() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center text-[var(--text-muted)] gap-2">
      <CheckSquare size={28} />
      <span className="text-xs">All clear</span>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="shimmer h-5 w-full rounded" />
      ))}
    </div>
  );
}
