import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[widget error]', this.props.label, error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="glass-card glass-card-error flex flex-col items-center justify-center text-center gap-2 p-6 text-[var(--accent-red)]">
          <AlertTriangle size={20} />
          <span className="text-xs text-[var(--text-secondary)]">
            {this.props.label || 'Widget'} crashed: {String(this.state.error.message || this.state.error)}
          </span>
        </div>
      );
    }
    return this.props.children;
  }
}
