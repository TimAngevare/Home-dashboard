import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { reloadIfNotRecent } from '../../lib/selfHeal.js';

/** Top-level catch-all. Unlike the per-widget ErrorBoundary, an error here
 * means the whole shell (Waves, TopBar, TabBar, SleepScreen) is gone - the
 * kiosk has no keyboard/mouse to recover it, so we self-heal with a reload
 * rather than sit on a blank/broken screen indefinitely. */
export default class FatalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[fatal]', error, info);
    setTimeout(reloadIfNotRecent, 3000);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            width: '100vw',
            height: '100vh',
            background: '#1a1410',
            color: '#f5e6d8',
          }}
        >
          <AlertTriangle size={28} />
          <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Something went wrong — reloading…</span>
        </div>
      );
    }
    return this.props.children;
  }
}
