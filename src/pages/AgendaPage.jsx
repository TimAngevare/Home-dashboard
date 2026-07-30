import WeatherCard from '../components/widgets/WeatherCard.jsx';
import CalendarWidget from '../components/widgets/CalendarWidget.jsx';

export default function AgendaPage() {
  return (
    <div className="page agenda-stack">
      <WeatherCard />
      <CalendarWidget />
    </div>
  );
}
