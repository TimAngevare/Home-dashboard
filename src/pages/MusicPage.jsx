import MusicPlayer from '../components/widgets/MusicPlayer.jsx';

export default function MusicPage() {
  return (
    <div className="page">
      <div className="card card-enter" style={{ height: '100%', overflow: 'hidden' }}>
        <MusicPlayer />
      </div>
    </div>
  );
}
