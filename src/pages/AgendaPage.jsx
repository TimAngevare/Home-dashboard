import WeatherWidget from '../components/widgets/WeatherWidget.jsx';
import CalendarWidget from '../components/widgets/CalendarWidget.jsx';

export default function AgendaPage() {
  return (
    <div className="page page-stack">
      <div className="page-stack-top">
        <WeatherWidget index={0} />
      </div>
      <div className="page-stack-bottom">
        <CalendarWidget index={1} />
      </div>
    </div>
  );
}
