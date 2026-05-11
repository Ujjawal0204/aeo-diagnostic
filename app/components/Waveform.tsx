/* Animated 4-bar equalizer waveform. Bars are anchored at the bottom and
   animate height via CSS scaleY (see .waveform-bar in globals.css). */

interface WaveformProps {
  size?: number;
}

// Each bar: [x, y, height] — all anchored at bottom of the 16px viewbox
const BARS: [number, number, number, string][] = [
  [0.5,  6, 10, "0ms"],
  [4.5,  2, 14, "200ms"],
  [8.5,  4, 12, "100ms"],
  [12.5, 5, 11, "300ms"],
];

export function Waveform({ size = 16 }: WaveformProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{ display: "inline-block", flexShrink: 0 }}
    >
      {BARS.map(([x, y, h, delay], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width={2.5}
          height={h}
          rx={1.25}
          fill="#00D982"
          className="waveform-bar"
          style={{ animationDelay: delay }}
        />
      ))}
    </svg>
  );
}
