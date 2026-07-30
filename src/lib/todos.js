const PRIORITY_ORDER = ['High', 'Medium', 'Low'];

export function priorityRank(p) {
  const idx = PRIORITY_ORDER.findIndex((x) => x.toLowerCase() === (p || '').toLowerCase());
  return idx === -1 ? PRIORITY_ORDER.length : idx;
}

export function sortByPriority(items) {
  return [...items].sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));
}

/** Splits open+locally-done items into the three priority columns the Tasks page shows. */
export function groupByPriority(items) {
  const groups = { High: [], Medium: [], Low: [] };
  for (const t of items) {
    const key = PRIORITY_ORDER.find((p) => p.toLowerCase() === (t.priority || '').toLowerCase()) || 'Low';
    groups[key].push(t);
  }
  return groups;
}

export const PRIORITY_COLORS = {
  High: 'var(--warn)',
  Medium: 'var(--warm)',
  Low: 'var(--accent2)',
};
