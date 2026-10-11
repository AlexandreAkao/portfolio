/**
 * Splits copy around its figures ("8+", "19", "200+", "40%", "95%+") so a world
 * can set them apart. Only standalone numbers count: the 2 in "B2B" does not.
 */
const FIGURE = /(?<![\p{L}\d])(\d+(?:%\+|\+|%)?)(?![\p{L}\d])/gu;

export interface Segment {
  text: string;
  figure: boolean;
}

export function splitFigures(text: string): Segment[] {
  const out: Segment[] = [];
  let last = 0;
  for (const match of text.matchAll(FIGURE)) {
    const start = match.index ?? 0;
    if (start > last) out.push({ text: text.slice(last, start), figure: false });
    out.push({ text: match[0], figure: true });
    last = start + match[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), figure: false });
  return out;
}
