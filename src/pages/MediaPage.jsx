import { Music4 } from 'lucide-react';
import GlassCard from '../components/layout/GlassCard.jsx';
import MediaWidget from '../components/widgets/MediaWidget.jsx';

export default function MediaPage() {
  return (
    <div className="page">
      <GlassCard
        title="Now Playing"
        icon={<Music4 size={16} className="text-[var(--accent-teal)]" />}
        className="h-full"
      >
        <MediaWidget />
      </GlassCard>
    </div>
  );
}
