import { useQuery } from '@tanstack/react-query';

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function useWidget(key, url, refreshIntervalSeconds) {
  const refreshMs = refreshIntervalSeconds * 1000;
  const query = useQuery({
    queryKey: [key],
    queryFn: () => fetchJson(url),
    refetchInterval: refreshMs,
    staleTime: Math.floor(refreshMs * 0.8),
  });

  const payload = query.data;
  const apiError = payload && payload.error === true ? payload.message : null;

  return {
    data: payload && !payload.error ? payload.data : null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error?.message || apiError || null,
    lastUpdated: query.dataUpdatedAt || null,
    refreshInterval: refreshIntervalSeconds,
  };
}
