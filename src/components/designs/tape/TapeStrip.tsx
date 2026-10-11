/**
 * A strip of eight-channel paper tape, drawn as SVG. Each character of `text`
 * is one column punched with its ASCII code (channel 1 at the bottom), with
 * the small feed hole between channels 3 and 4. With no text, the tape is
 * leader: feed holes only. Decorative: the words it encodes are on the page.
 */
const PITCH = 14; // px between columns, like 0.1in tape scaled to screen
const ROW = 7.2; // px between channels
const HOLE = 3.1; // data hole radius
const FEED = 1.7; // feed hole radius

interface Props {
  text?: string;
  /** Number of columns to draw (the text repeats to fill them) */
  columns?: number;
  className?: string;
}

export default function TapeStrip({ text = '', columns = 220, className = '' }: Props) {
  const height = ROW * 10;
  const holes: string[] = [];
  for (let c = 0; c < columns; c++) {
    const x = PITCH / 2 + c * PITCH;
    holes.push(`M${x - FEED} ${ROW * 6}a${FEED} ${FEED} 0 1 0 ${FEED * 2} 0a${FEED} ${FEED} 0 1 0 ${-FEED * 2} 0`);
    if (!text) continue;
    const code = text.charCodeAt(c % text.length) & 0xff;
    for (let bit = 0; bit < 8; bit++) {
      if (!((code >> bit) & 1)) continue;
      // channels 1-3 below the feed hole (row 6), channels 4-8 above it
      const y = ROW * (bit < 3 ? 9 - bit : 8 - bit);
      holes.push(`M${x - HOLE} ${y}a${HOLE} ${HOLE} 0 1 0 ${HOLE * 2} 0a${HOLE} ${HOLE} 0 1 0 ${-HOLE * 2} 0`);
    }
  }
  return (
    <svg
      className={className}
      width={columns * PITCH}
      height={height}
      viewBox={`0 0 ${columns * PITCH} ${height}`}
      aria-hidden="true"
      focusable="false"
    >
      <path d={holes.join('')} fill="currentColor" />
    </svg>
  );
}
