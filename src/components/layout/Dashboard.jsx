import TopBar from './TopBar.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';
import WeatherWidget from '../widgets/WeatherWidget.jsx';
import NewsWidget from '../widgets/NewsWidget.jsx';
import LightsWidget from '../widgets/LightsWidget.jsx';
import NetworkWidget from '../widgets/NetworkWidget.jsx';
import CalendarWidget from '../widgets/CalendarWidget.jsx';
import TodoWidget from '../widgets/TodoWidget.jsx';

export default function Dashboard() {
  return (
    <div className="dashboard-root">
      <TopBar />
      <div className="dashboard-grid">
        <div className="grid-area-weather">
          <ErrorBoundary label="Weather">
            <WeatherWidget index={0} />
          </ErrorBoundary>
        </div>
        <div className="grid-area-news">
          <ErrorBoundary label="News">
            <NewsWidget index={1} />
          </ErrorBoundary>
        </div>
        <div className="grid-area-calendar">
          <ErrorBoundary label="Calendar">
            <CalendarWidget index={2} />
          </ErrorBoundary>
        </div>
        <div className="grid-area-lights">
          <ErrorBoundary label="Lights">
            <LightsWidget index={3} />
          </ErrorBoundary>
        </div>
        <div className="grid-area-network">
          <ErrorBoundary label="Network">
            <NetworkWidget index={4} />
          </ErrorBoundary>
        </div>
        <div className="grid-area-todos">
          <ErrorBoundary label="Todos">
            <TodoWidget index={5} />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
