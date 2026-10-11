/**
 * Tape's state marks, drawn in one 2px stroke: a cross for done, the band of
 * an active frame, the folded flag that marks "now", and the arrow on the
 * Email key. Decorative: the words beside them carry the meaning.
 */
interface MarkProps {
  className?: string;
}

export function Cross({ className = '' }: MarkProps) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
      <path d="M1.5 1.5l9 9M10.5 1.5l-9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="square" fill="none" />
    </svg>
  );
}

export function Band({ className = '' }: MarkProps) {
  return (
    <svg className={className} width="22" height="12" viewBox="0 0 22 12" aria-hidden="true" focusable="false">
      <rect x="1" y="1" width="20" height="10" style={{ fill: 'var(--window-ink)' }} stroke="currentColor" strokeWidth="2" />
      <rect x="1" y="7" width="20" height="4" fill="currentColor" />
    </svg>
  );
}

export function Flag({ className = '' }: MarkProps) {
  return (
    <svg className={className} width="22" height="44" viewBox="0 0 22 44" aria-hidden="true" focusable="false">
      <path d="M0 0h22v44l-11-9.5L0 44z" fill="currentColor" />
    </svg>
  );
}

export function Arrow({ className = '' }: MarkProps) {
  return (
    <svg className={className} width="40" height="24" viewBox="0 0 40 24" aria-hidden="true" focusable="false">
      <path d="M0 12h34M24 2l11 10-11 10" stroke="currentColor" strokeWidth="4" strokeLinejoin="miter" fill="none" />
    </svg>
  );
}
