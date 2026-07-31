import { useState } from 'react';
import TopBar from './TopBar.jsx';
import TabBar from './TabBar.jsx';
import Waves from './Waves.jsx';
import SleepScreen from './SleepScreen.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';
import FatalErrorBoundary from './FatalErrorBoundary.jsx';
import { useWidget } from '../../hooks/useWidget.js';
import { useDisplayMode } from '../../hooks/useDisplayMode.js';
import HomePage from '../../pages/HomePage.jsx';
import MusicPage from '../../pages/MusicPage.jsx';
import AgendaPage from '../../pages/AgendaPage.jsx';
import TasksPage from '../../pages/TasksPage.jsx';
import SystemPage from '../../pages/SystemPage.jsx';

const PAGES = {
  home: HomePage,
  music: MusicPage,
  agenda: AgendaPage,
  tasks: TasksPage,
  system: SystemPage,
};

export default function Dashboard() {
  const [active, setActive] = useState('home');
  const { data: weather } = useWidget('weather', '/api/weather', 600);
  const display = useDisplayMode(weather?.sun);
  const Page = PAGES[active] || HomePage;

  return (
    <FatalErrorBoundary>
      <div
        className={`dashboard-root ${display.themeClass}`}
        style={{ '--sleep-b': display.dim / 100 }}
      >
        <Waves />
        <div className="dashboard-shell">
          {display.mode === 'sleep' ? (
            <SleepScreen dim={display.dim} setDim={display.setDim} wake={display.wake} />
          ) : (
            <>
              <TopBar
                mode={display.mode}
                setMode={display.setMode}
                auto={display.auto}
                toggleAuto={display.toggleAuto}
                sunsetLabel={display.sunsetLabel}
              />
              <div className="page-container">
                <ErrorBoundary label={active}>
                  <Page />
                </ErrorBoundary>
              </div>
              <TabBar active={active} onChange={setActive} />
            </>
          )}
        </div>
      </div>
    </FatalErrorBoundary>
  );
}
