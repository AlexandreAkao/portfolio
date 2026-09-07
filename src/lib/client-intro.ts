import type { ClientDirective } from 'astro';

/**
 * client:intro
 * Loads the island's code immediately but delays hydration until the site
 * intro curtain starts to lift, so hero entrances play as the curtain opens
 * instead of behind it. Hydrates at once when there is no intro (reduced
 * motion, in-site navigation, or the curtain already revealed the page).
 */
const introDirective: ClientDirective = (load, _opts, el) => {
  const modulePromise = load();
  let hydrated = false;
  const run = async () => {
    if (hydrated) return;
    hydrated = true;
    const hydrate = await modulePromise;
    await hydrate();
  };

  // Islands inside an inactive world sit under display:none; hydrating them
  // there would start scenes nobody sees. Hydrate visible ones now and the
  // rest the first time their world is switched on.
  // <astro-island> is display:contents and reports no rects of its own, and its
  // first child may be a boxless <link> preload, so ask the world wrapper first
  // and fall back to any child that has a box.
  const visible = () => {
    const wrapper = el.closest<HTMLElement>('[data-design-show]');
    if (wrapper) return getComputedStyle(wrapper).display !== 'none';
    return Array.from(el.children).some((child) => child.getClientRects().length > 0);
  };
  let observer: MutationObserver | undefined;
  const whenVisible = () => {
    if (visible()) { void run(); return; }
    observer = new MutationObserver(() => {
      if (visible()) { observer?.disconnect(); void run(); }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-design'] });
    // Safety net: an island still hidden after the page has settled hydrates
    // anyway. Expensive scenes already gate their own render loops on the
    // active design, so a late hydration costs little and a blank hero costs
    // the visit.
    const settle = () => window.setTimeout(() => { observer?.disconnect(); void run(); }, 4000);
    if ('requestIdleCallback' in window) window.requestIdleCallback(settle); else settle();
  };

  const state = document.documentElement.dataset.intro;
  if (state === 'wait' || state === 'play') {
    document.addEventListener('site-intro:reveal', whenVisible, { once: true });
  } else {
    whenVisible();
  }
};

export default introDirective;
