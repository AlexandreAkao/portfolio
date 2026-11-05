/**
 * Runs the arrival (intro.ts) on the live room. SiteIntro arms it on a first
 * visit (<html data-dio-intro="play">: the room alone, centred, no header, no
 * page; see worlds/diorama.css) and lifts its curtain once the room has drawn.
 * The script holds its first frame (07:59, only the base) until the curtain
 * has gone, then runs; at ARRIVAL.page the flag turns to "page" and the day's
 * page is laid beside the room, and once that has settled the flag drops. A
 * session that has already seen it (data-dio-again) gets the quick build. A
 * scroll, a key or a pointer anywhere means "let me read": straight to the day.
 * Returns the frame to lay over the day's sample, or null.
 */
import { useCallback, useEffect, useRef } from 'react';
import { ARRIVAL, RETURN, arrival, type IntroFrame } from './intro';

/** The page's own entrance after the cue: the paper and the room's glide (0.8s), the copy's fade (0.35s + 0.5s). */
const SETTLE = 0.9;
const SKIP = ['wheel', 'touchmove', 'keydown', 'pointerdown'] as const;

export function useArrival(still: boolean): () => IntroFrame | null {
  const state = useRef({ armed: false, start: null as number | null, timing: ARRIVAL });

  useEffect(() => {
    const html = document.documentElement;
    if (still || html.dataset.dioIntro !== 'play') return;
    const s = state.current;
    s.armed = true;
    s.start = null;
    s.timing = 'dioAgain' in html.dataset ? RETURN : ARRIVAL;
    const timers: number[] = [];

    const off = () => {
      SKIP.forEach((type) => window.removeEventListener(type, end, true));
      document.removeEventListener('site-intro:done', begin);
      timers.forEach(clearTimeout);
    };
    function end() {
      s.armed = false;
      off();
      delete html.dataset.dioIntro;
    }
    function begin() {
      if (s.start !== null || !s.armed) return;
      s.start = performance.now();
      timers.push(window.setTimeout(() => {
        if (html.dataset.dioIntro) html.dataset.dioIntro = 'page';
      }, s.timing.page * 1000));
      timers.push(window.setTimeout(end, (s.timing.page + SETTLE) * 1000));
    }

    SKIP.forEach((type) => window.addEventListener(type, end, { capture: true, passive: true }));
    if (html.dataset.intro === 'done') begin();
    else document.addEventListener('site-intro:done', begin, { once: true });
    // Leaving mid-arrival (a lost context, a switch of world) hands the page back
    return () => {
      if (s.armed || html.dataset.dioIntro) end();
      else off();
    };
  }, [still]);

  return useCallback(() => {
    const s = state.current;
    if (!s.armed) return null;
    const f = arrival(s.start === null ? 0 : (performance.now() - s.start) / 1000, s.timing);
    // The script is over; the page's flag drops on its own timer, once the page has settled
    if (!f) s.armed = false;
    return f;
  }, []);
}
