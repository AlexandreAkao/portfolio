/** The return arrow printed on the Enter keycap. Decorative: the key's label carries the action. */
export default function EnterGlyph() {
  return (
    <svg className="clay-key__glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M19 5v6.5a3 3 0 0 1-3 3H6.5M10.5 10.5l-4 4 4 4" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Plus (closed) or minus (open), printed on a details keycap in the Enter glyph's stroke. Decorative. */
export function ToggleGlyph({ open }: { open: boolean }) {
  return (
    <svg className="clay-key__glyph clay-key__glyph--sm" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={open ? 'M6 12h12' : 'M12 6v12M6 12h12'} fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
}
