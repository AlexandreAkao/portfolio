import { useContext, type ComponentType } from 'react';
import { ServerLocaleContext } from './useLocale';
import type { Locale } from './utils';

/**
 * Lets an island take the page's language as a `locale` prop and render in it
 * on the server. Without the prop it inherits the surrounding island's
 * language, so a component used both as an island and inside one stays right.
 */
export function withServerLocale<P extends object>(Component: ComponentType<P>) {
  function WithServerLocale({ locale, ...props }: P & { locale?: Locale }) {
    const inherited = useContext(ServerLocaleContext);
    return (
      <ServerLocaleContext.Provider value={locale ?? inherited}>
        <Component {...(props as P)} />
      </ServerLocaleContext.Provider>
    );
  }
  WithServerLocale.displayName = `WithServerLocale(${Component.displayName ?? Component.name})`;
  return WithServerLocale;
}
