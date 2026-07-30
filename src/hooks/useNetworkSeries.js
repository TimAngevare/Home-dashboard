import { useEffect, useRef, useState } from 'react';
import { useWidget } from './useWidget.js';

const MAX_POINTS = 60;

/** Shared network polling + rolling throughput series, used by the Home mini card and the System page chart. */
export function useNetworkSeries() {
  const widget = useWidget('network', '/api/network', 5);
  const [series, setSeries] = useState([]);
  const lastTs = useRef(0);

  useEffect(() => {
    if (!widget.data || widget.data.ts === lastTs.current) return;
    lastTs.current = widget.data.ts;
    setSeries((prev) => {
      const next = [
        ...prev,
        { ts: widget.data.ts, down: Number(widget.data.downMbps.toFixed(2)), up: Number(widget.data.upMbps.toFixed(2)) },
      ];
      if (next.length > MAX_POINTS) next.splice(0, next.length - MAX_POINTS);
      return next;
    });
  }, [widget.data]);

  return { ...widget, series };
}
