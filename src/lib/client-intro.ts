import type { ClientDirective } from 'astro';

/**
 * client:intro
 *
 * Hydration for the per-world heroes. Three things it does:
 * 1. Waits for the intro curtain's reveal before hydrating, so entrances play
 *    as the curtain opens instead of behind it.
 * 2. Loads and hydrates only the island whose world is on screen. Hidden worlds
 *    cost nothing until they are switched on: their code (a WebGL hero pulls
 *    in the whole Three.js chunk) is fetched the moment they become visible.
 * 3. Warms hidden islands' code on intent: when the design switcher opens, every
 *    hidden hero starts loading, so the switch a moment later hydrates fast.
 */
const introDirective: ClientDirective = (load, _opts, el) => {
  const html = document.documentElement;
  let modulePromise: ReturnType<typeof load> | undefined;
  let hydrated = false;

  // Fetch the component's code (and its dependencies) without hydrating.
  const warm = () => (modulePromise ??= load());
  const run = async () => {
    if (hydrated) return;
    hydrated = true;
    const hydrate = await warm();
    await hydrate();
  };

  // <astro-island> is display:contents and reports no rects of its own, and its
  // first child may be a boxless <link> preload, so ask the world wrapper first
  // and fall back to any child that has a box.
  const wrapper = el.closest<HTMLElement>('[data-design-show]');
  const visible = () => {
    if (wrapper) return getComputedStyle(wrapper).display !== 'none';
    return Array.from(el.children).some((child) => child.getClientRects().length > 0);
  };
  // Independent second reading used by the safety net: the wrapper names the
  // world it belongs to, and <html data-design> names the active one.
  const belongsToActiveWorld = () => !wrapper || wrapper.getAttribute('data-design-show') === html.dataset.design;

  const whenVisible = () => {
    if (visible()) { void run(); return; }

    const observer = new MutationObserver(() => {
      if (visible()) { observer.disconnect(); void run(); }
    });
    observer.observe(html, { attributes: true, attributeFilter: ['data-design'] });

    // Intent: the switcher opened, a switch is likely within seconds.
    document.addEventListener('site-design:intent', () => { void warm(); }, { once: true });

    // Safety net against a wrong visibility reading: after the page settles,
    // hydrate only if the second reading says this island's world is the
    // active one. A hidden world is never fetched here.
    const settle = () => window.setTimeout(() => {
      if (!hydrated && belongsToActiveWorld()) { observer.disconnect(); void run(); }
    }, 4000);
    if ('requestIdleCallback' in window) window.requestIdleCallback(settle); else settle();
  };

  const state = html.dataset.intro;
  if (state === 'wait' || state === 'play') {
    document.addEventListener('site-intro:reveal', whenVisible, { once: true });
  } else {
    whenVisible();
  }
};

export default introDirective;
