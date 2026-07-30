import { useState } from 'react';
import TopBar from './TopBar.jsx';
import TabBar from './TabBar.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';
import HomePage from '../../pages/HomePage.jsx';
import MediaPage from '../../pages/MediaPage.jsx';
import AgendaPage from '../../pages/AgendaPage.jsx';
import TodosPage from '../../pages/TodosPage.jsx';
import SystemPage from '../../pages/SystemPage.jsx';

const PAGES = {
  home: HomePage,
  media: MediaPage,
  agenda: AgendaPage,
  todos: TodosPage,
  system: SystemPage,
};

export default function Dashboard() {
  const [active, setActive] = useState('home');
  const Page = PAGES[active] || HomePage;

  return (
    <div className="dashboard-root">
      <TopBar />
      <div className="page-container">
        <ErrorBoundary label={active}>
          <Page />
        </ErrorBoundary>
      </div>
      <TabBar active={active} onChange={setActive} />
    </div>
  );
}
