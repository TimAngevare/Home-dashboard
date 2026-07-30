import PiCard from '../components/widgets/PiCard.jsx';
import NetworkCard from '../components/widgets/NetworkCard.jsx';
import { N8nPanel } from '../components/widgets/N8nWidget.jsx';

export default function SystemPage() {
  return (
    <div className="page system-grid">
      <div className="system-grid-left">
        <PiCard />
        <NetworkCard />
      </div>
      <div className="system-grid-right">
        <N8nPanel />
      </div>
    </div>
  );
}
