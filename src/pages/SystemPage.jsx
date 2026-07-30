import { Cpu, HardDrive } from 'lucide-react';
import GlassCard from '../components/layout/GlassCard.jsx';
import PiSystemWidget from '../components/widgets/PiSystemWidget.jsx';
import StorageWidget from '../components/widgets/StorageWidget.jsx';
import NetworkWidget from '../components/widgets/NetworkWidget.jsx';

export default function SystemPage() {
  return (
    <div className="page system-grid">
      <div className="system-grid-left">
        <GlassCard title="Raspberry Pi" icon={<Cpu size={16} className="text-[var(--accent-blue)]" />}>
          <PiSystemWidget />
        </GlassCard>
        <GlassCard title="Storage" icon={<HardDrive size={16} className="text-[var(--accent-teal)]" />}>
          <StorageWidget />
        </GlassCard>
      </div>
      <div className="system-grid-right">
        <NetworkWidget index={0} />
      </div>
    </div>
  );
}
