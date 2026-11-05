/**
 * Runs the arrival (intro.ts) on the live room. SiteIntro arms it on a first
 * visit (<html data-dio-intro="play">: the room alone, centred, no header, no
 * page; see worlds/diorama.css) and lifts its curtain once the room has drawn.
 * The script holds its first frame (07:59, only the base) until the curtain
 * has gone, then runs; at ARRIVAL.page the flag turns to "page" and the day's
 * page is laid beside the room, and once that has settled the flag drops. A
 * session that has already seen it (data-dio-again) gets the quick build.
 * A reload at the top of the day has no curtain and no flag: the page is there
 * to read and the panel runs the loading (data-dio-top), so the quick build
 * plays in the panel once the room has drawn (data-dio-panel). A scroll, a key
 * or a pointer anywhere means "let me read": straight to the day. Returns the
 * frame to lay over the day's sample, or null.
 */
import { useCallback, useEffect, useRef } from 'react';
import { ARRIVAL, RETURN, arrival, type IntroFrame } from './intro';

/** The page's own entrance after the cue: the paper and the room's glide (0.8s), the copy's fade (0.35s + 0.5s). */
const SETTLE = 0.9;
const SKIP = ['wheel', 'touchmove', 'keydown', 'pointerdown'] as const;
/** A room this late comes in as it is: the still has been standing in for it (worlds/diorama.css), in ms since the page began. */
const LATE = 10_000;

/** A load at the top of the day with no curtain over it, while the room is still expected and not late. */
function inPanel(html: HTMLElement): boolean {
  return (
    !html.dataset.dioIntro &&
    'dioTop' in html.dataset &&
    'dioRoom' in html.dataset &&
    (!html.dataset.intro || html.dataset.intro === 'done') &&
    window.scrollY < window.innerHeight / 2 &&
    performance.now() < LATE
  );
}

export function useArrival(still: boolean): () => IntroFrame | null {
  const state = useRef({ armed: false, start: null as number | null, timing: ARRIVAL });

  useEffect(() => {
    const html = document.documentElement;
    if (still) return;
    const panel = inPanel(html);
    if (!panel && html.dataset.dioIntro !== 'play') return;
    const s = state.current;
    s.armed = true;
    s.start = null;
    s.timing = panel || 'dioAgain' in html.dataset ? RETURN : ARRIVAL;
    if (panel) html.dataset.dioPanel = '';
    const opened = panel ? 'site-hero:ready' : 'site-intro:done';
    const timers: number[] = [];

    const off = () => {
      SKIP.forEach((type) => window.removeEventListener(type, end, true));
      document.removeEventListener(opened, begin);
      timers.forEach(clearTimeout);
    };
    function end() {
      s.armed = false;
      off();
      delete html.dataset.dioIntro;
      delete html.dataset.dioPanel;
    }
    function begin() {
      if (s.start !== null || !s.armed) return;
      if (panel && performance.now() >= LATE) {
        end();
        return;
      }
      s.start = performance.now();
      if (panel) {
        // The page is already there: nothing to lay beside the room
        timers.push(window.setTimeout(end, s.timing.end * 1000));
        return;
      }
      timers.push(window.setTimeout(() => {
        if (html.dataset.dioIntro) html.dataset.dioIntro = 'page';
      }, s.timing.page * 1000));
      timers.push(window.setTimeout(end, (s.timing.page + SETTLE) * 1000));
    }

    SKIP.forEach((type) => window.addEventListener(type, end, { capture: true, passive: true }));
    if (!panel && html.dataset.intro === 'done') begin();
    else document.addEventListener(opened, begin, { once: true });
    // Leaving mid-arrival (a lost context, a switch of world) hands the page back
    return () => {
      if (s.armed || html.dataset.dioIntro || panel) end();
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
