/**
 * Three-layer animated wave background. Sits behind everything in the
 * dashboard root (which is position:relative). Colours come from
 * --w1/--w2/--w3, motion pauses via --wave-play in sleep mode.
 */

const WAVE =
  'M0 160 C85 120 171 120 256 160 C341 200 427 200 512 160 ' +
  'C597 120 683 120 768 160 C853 200 939 200 1024 160 ' +
  'C1109 120 1195 120 1280 160 C1365 200 1451 200 1536 160 ' +
  'C1621 120 1707 120 1792 160 C1877 200 1963 200 2048 160 ' +
  'L2048 320 L0 320 Z';

const LAYERS = [
  { fill: 'var(--w1)', animation: 'waveA 26s linear infinite' },
  { fill: 'var(--w2)', animation: 'waveB 41s linear infinite', transform: 'scaleY(1.25)' },
  { fill: 'var(--w3)', animation: 'waveA 62s linear infinite', transform: 'scaleY(1.6) translateY(26px)' },
];

export default function Waves() {
  return (
    <svg
      viewBox="0 0 2048 320"
      preserveAspectRatio="none"
      aria-hidden
      style={{
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: 2048,
        height: 300,
        pointerEvents: 'none',
        opacity: 0.9,
      }}
    >
      {LAYERS.map((l, i) => (
        <path
          key={i}
          d={WAVE}
          fill={l.fill}
          style={{
            transformOrigin: 'center bottom',
            transform: l.transform,
            animation: l.animation,
            animationPlayState: 'var(--wave-play, running)',
          }}
        />
      ))}
    </svg>
  );
}
