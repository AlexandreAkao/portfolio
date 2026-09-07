import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { useLocale } from '@i18n/useLocale';
import { t, type Locale } from '@i18n/utils';

/**
 * The spine of the Linha Verde world: one scroll value drives the train
 * marker, the station bullets, and the `--arrival` custom property every
 * section reads. Runs only while <html data-design="metro">.
 */
const DESIGN_ID = 'metro';
const HEADER_OFFSET = 80;
const BULLET = 14;
const MARKER_LEN = 34; // capsule length along the line (px)
const MONO = "'Overpass Mono', monospace";

const NAV_KEYS: Record<string, string> = {
  hero: 'nav.home',
  about: 'nav.about',
  experience: 'nav.experience',
  skills: 'nav.skills',
  projects: 'nav.projects',
  contact: 'nav.contact',
};

interface Station {
  id: string;
  label: string;
  /** Position along the line, 0 at the top of the document, 1 at max scroll. */
  ratio: number;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function stationLabel(id: string, locale: Locale): string {
  const key = NAV_KEYS[id];
  if (key) return t(key, locale);
  if (id === 'education') return locale === 'pt' ? 'Formação' : 'Education';
  return id.charAt(0).toUpperCase() + id.slice(1);
}

export default function MetroLine() {
  const locale = useLocale();
  const reduced = useReducedMotion();
  const railRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [current, setCurrent] = useState('hero');
  const [railLength, setRailLength] = useState(0);
  const [stripLength, setStripLength] = useState(0);

  const { scrollYProgress } = useScroll();
  const spring = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  const progress = reduced ? scrollYProgress : spring;
  const trackV = Math.max(0, railLength - MARKER_LEN);
  const trackH = Math.max(0, stripLength - MARKER_LEN);
  const y = useTransform(progress, [0, 1], [0, trackV]);
  const x = useTransform(progress, [0, 1], [0, trackH]);

  useEffect(() => {
    const html = document.documentElement;
    let active = false;
    let raf = 0;
    let sections: HTMLElement[] = [];
    let maxScroll = 1;
    // A station, once reached, stays open: scrolling back up never closes its doors.
    const arrived = new Map<string, number>();

    const measure = () => {
      sections = Array.from(document.querySelectorAll<HTMLElement>('main > section[id]'));
      maxScroll = Math.max(1, html.scrollHeight - window.innerHeight);
      setStations(
        sections.map((s) => {
          const top = s.getBoundingClientRect().top + window.scrollY;
          return { id: s.id, label: stationLabel(s.id, locale), ratio: clamp01((top - HEADER_OFFSET) / maxScroll) };
        })
      );
      setRailLength(railRef.current?.clientHeight ?? 0);
      setStripLength(stripRef.current?.clientWidth ?? 0);
    };

    const publish = () => {
      raf = 0;
      const vh = window.innerHeight;
      html.style.setProperty('--line-progress', clamp01(window.scrollY / maxScroll).toFixed(4));
      let cur = sections[0]?.id ?? 'hero';
      for (const s of sections) {
        const top = s.getBoundingClientRect().top;
        const rect = s.getBoundingClientRect();
        const fullyInView = rect.bottom <= vh + 1;
        const atPageEnd = window.scrollY >= maxScroll - 2;
        const computed = reduced || fullyInView || atPageEnd ? 1 : clamp01((vh * 0.85 - top) / (vh * 0.5));
        const arrival = Math.max(arrived.get(s.id) ?? 0, computed);
        arrived.set(s.id, arrival);
        s.style.setProperty('--arrival', arrival.toFixed(3));
        if (top <= vh * 0.5) cur = s.id;
      }
      setCurrent((prev) => (prev === cur ? prev : cur));
    };

    const schedule = () => {
      if (active && !raf) raf = requestAnimationFrame(publish);
    };
    const onResize = () => {
      if (!active) return;
      measure();
      schedule();
    };
    const ro = new ResizeObserver(onResize);

    const start = () => {
      if (active) return;
      active = true;
      arrived.clear();
      measure();
      publish();
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', onResize);
      ro.observe(document.body);
    };
    const stop = () => {
      if (!active) return;
      active = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', onResize);
      ro.disconnect();
    };

    const sync = () => (html.dataset.design === DESIGN_ID ? start() : stop());
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(html, { attributes: true, attributeFilter: ['data-design'] });
    return () => {
      mo.disconnect();
      stop();
    };
  }, [locale, reduced]);

  const currentLabel = stations.find((s) => s.id === current)?.label ?? '';

  return (
    <>
      {/* Desktop: vertical rail on the left margin */}
      <div aria-hidden="true" className="pointer-events-none fixed bottom-6 left-4 top-20 z-[45] hidden w-14 md:block">
        <div ref={railRef} className="relative h-full">
          <span className="absolute bottom-0 left-6 top-0 w-1.5 rounded-full bg-accent" />
          {stations.map((s) => {
            const centre = MARKER_LEN / 2 + s.ratio * trackV;
            const isCurrent = s.id === current;
            return (
              <div key={s.id} className="absolute left-0 h-3.5 w-14" style={{ top: centre - BULLET / 2 }}>
                <span className="absolute left-5 top-0 h-3.5 w-3.5 rounded-full border-[3px] border-accent bg-white" />
                <span
                  className={`pointer-events-auto absolute left-10 top-1/2 hidden -translate-y-1/2 whitespace-nowrap text-xs uppercase tracking-[0.08em] transition-colors lg:inline ${
                    isCurrent ? 'font-bold text-text' : 'text-text-secondary'
                  }`}
                  style={{ fontFamily: MONO }}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
          <motion.div
            className="absolute left-[17px] top-0 flex h-[34px] w-5 items-center justify-center rounded-full border-[3px] border-accent bg-white"
            style={{ y }}
          >
            <span className="h-3 w-2 rounded-[2px] bg-accent" />
          </motion.div>
        </div>
      </div>

      {/* Mobile: horizontal strip under the header */}
      <div aria-hidden="true" className="fixed left-0 right-0 top-16 z-40 h-10 border-b border-border bg-bg/90 backdrop-blur md:hidden">
        <div ref={stripRef} className="relative mx-4 h-full">
          <span className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-accent" />
          {stations.map((s) => {
            const centre = MARKER_LEN / 2 + s.ratio * trackH;
            return (
              <span
                key={s.id}
                className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-[3px] border-accent bg-white"
                style={{ left: centre - BULLET / 2 }}
              />
            );
          })}
          <motion.div
            className="absolute left-0 top-2.5 flex h-5 w-[34px] items-center justify-center rounded-full border-[3px] border-accent bg-white"
            style={{ x }}
          >
            <span className="h-2 w-3 rounded-[2px] bg-accent" />
          </motion.div>
          <span
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-bg/90 pl-2 text-xs font-bold uppercase tracking-[0.08em] text-text"
            style={{ fontFamily: MONO }}
          >
            {currentLabel}
          </span>
        </div>
      </div>
    </>
  );
}
