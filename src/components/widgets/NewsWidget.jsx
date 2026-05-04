import { Newspaper } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';
import GlassCard from '../layout/GlassCard.jsx';
import { useWidget } from '../../hooks/useWidget.js';

export default function NewsWidget({ index }) {
  const { data, isLoading, error, lastUpdated, refreshInterval } = useWidget(
    'news',
    '/api/news',
    900,
  );
  const status = error ? 'error' : isLoading ? 'loading' : 'ok';
  const items = data?.items || [];

  return (
    <GlassCard
      title="News"
      icon={<Newspaper size={16} className="text-[var(--accent-blue)]" />}
      refreshInterval={refreshInterval}
      lastUpdated={lastUpdated}
      status={status}
      error={error}
      index={index}
      bodyClassName="overflow-hidden"
    >
      {items.length ? (
        <div className="news-scroll-mask h-full">
          <div className="news-scroll">
            {[...items, ...items].map((item, i) => (
              <a
                key={`${item.link}-${i}`}
                className="news-item"
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span
                  className="news-source"
                  style={{ background: `${item.color}22`, color: item.color, borderColor: `${item.color}55` }}
                >
                  {item.source}
                </span>
                <span className="news-title">{item.title}</span>
                <span className="news-time">
                  {item.published
                    ? formatDistanceToNowStrict(new Date(item.published), { addSuffix: true })
                    : ''}
                </span>
              </a>
            ))}
          </div>
        </div>
      ) : (
        <Skeleton />
      )}
    </GlassCard>
  );
}

function Skeleton() {
  return (
    <div className="h-full flex flex-col gap-2">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="shimmer h-8 w-full rounded" />
      ))}
    </div>
  );
}
