/**
 * Hand-lettered title type: every letter sits a little off the baseline at its
 * own small tilt, the way a title artist inked credits one letter at a time.
 * Assistive tech reads the words once; the letters are drawn for the eye.
 * Words never break inside, and each word of `lines` starts a line of its own.
 */

import { Fragment, type CSSProperties } from 'react';

// Fixed per position so server and client draw the same letters
const TILT = [-3, 2, -1.5, 3, -2.5, 1, 2.5, -1, 1.5, -2];
const RISE = [0.02, -0.03, 0.01, -0.02, 0.03, -0.01, 0.02, -0.025, 0.015, 0];

interface Props {
  text: string;
  /** One word per line (the hero's name); otherwise words wrap as they fit. */
  lines?: boolean;
  /** Offsets the letter pattern, so neighbouring headings do not tilt alike. */
  seed?: number;
}

export default function Lettering({ text, lines = false, seed = 0 }: Props) {
  let n = seed;
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className={lines ? 'cartoon-letters cartoon-letters--lines' : 'cartoon-letters'}>
        {words.map((word, w) => (
          <Fragment key={w}>
            {!lines && w > 0 ? ' ' : null}
            <span className="cartoon-word">
              {[...word].map((ch, i) => {
                const k = n++;
                return (
                  <span
                    key={i}
                    className="cl"
                    style={{ '--r': `${TILT[k % TILT.length]}deg`, '--y': `${RISE[k % RISE.length]}em`, '--i': k - seed } as CSSProperties}
                  >
                    {ch}
                  </span>
                );
              })}
            </span>
          </Fragment>
        ))}
      </span>
    </>
  );
}
