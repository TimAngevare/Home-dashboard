import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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

/** POST a JSON body to `url` and refetch `invalidateKeys` widgets afterwards. */
export function useAction(invalidateKeys) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({ url, body }) => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body || {}),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.error) throw new Error(json?.message || `HTTP ${res.status}`);
      return json;
    },
    onSettled: () => {
      for (const key of invalidateKeys || []) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
    },
  });

  return {
    act: (url, body) => mutation.mutateAsync({ url, body }),
    isActing: mutation.isPending,
  };
}
