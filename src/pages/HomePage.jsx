import { Home } from 'lucide-react';
import GlassCard from '../components/layout/GlassCard.jsx';
import HomeControlsWidget from '../components/widgets/HomeControlsWidget.jsx';

export default function HomePage() {
  return (
    <div className="page">
      <GlassCard
        title="Lights & Switches"
        icon={<Home size={16} className="text-[var(--accent-amber)]" />}
        className="h-full"
        bodyClassName="overflow-y-auto"
      >
        <HomeControlsWidget />
      </GlassCard>
    </div>
  );
}
