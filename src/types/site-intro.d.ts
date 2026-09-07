export {};

declare global {
  interface Window {
    /** Exposed by src/components/common/SiteIntro.astro */
    siteIntro?: {
      /** Stage a theme switch behind the incoming world's curtain. Returns false when the caller should transition on its own. */
      quickChange: (design: string, apply: () => void) => boolean;
    };
  }
}
