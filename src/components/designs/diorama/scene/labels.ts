/**
 * The day's navigation links, by station, so the stage can pin each one over
 * its object. The hero registers them (as ref callbacks); the stage's driver
 * walks them every frame. No three here: the hero imports it eagerly.
 */
import type { StationId } from '../day';

const labels = new Map<StationId, HTMLElement>();

/** Register a station's link, or forget it when `el` is null (the link unmounted). */
export function registerLabel(id: StationId, el: HTMLElement | null): void {
  if (el) labels.set(id, el);
  else labels.delete(id);
}

export function eachLabel(fn: (id: StationId, el: HTMLElement) => void): void {
  labels.forEach((el, id) => fn(id, el));
}
