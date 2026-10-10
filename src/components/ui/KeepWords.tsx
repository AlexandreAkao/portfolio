import { Fragment } from 'react';

/**
 * Renders text so a hyphenated word ("Full-Stack") never breaks at its hyphen:
 * a role line wraps between words, not inside one.
 */
export default function KeepWords({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\S+-\S+)/).map((part, i) =>
        part.includes('-') ? (
          <span key={i} className="whitespace-nowrap">
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
