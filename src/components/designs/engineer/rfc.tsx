import { splitFigures } from '@/lib/figures';
import type { Locale } from '@i18n/utils';

/** The draft's file name, as typed at the prompt. Code, so it is not translated. */
export const RFC_FILE = 'draft-akira-full-stack-engineer.txt';

/** Month and year of the build, the way an Internet-Draft dates itself. */
export const rfcDate = (locale: Locale) =>
  new Intl.DateTimeFormat(locale === 'pt' ? 'pt-BR' : 'en', { month: 'long', year: 'numeric' }).format(new Date());

/** Copy with its figures in reverse video, like `less` search matches. */
export function Figures({ text }: { text: string }) {
  return (
    <>
      {splitFigures(text).map((s, i) => (s.figure ? <mark key={i} className="rfc-mark">{s.text}</mark> : s.text))}
    </>
  );
}
