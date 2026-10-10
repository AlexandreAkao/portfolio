export interface DesignConfig {
  id: string;
  label: string;
  icon: string;
  order: number;
}

export const designs: DesignConfig[] = [
  { id: 'editorial', label: 'Editorial', icon: '01', order: 0 },
  { id: 'avantgarde', label: 'Avant-garde', icon: '//', order: 1 },
  { id: 'engineer', label: 'Engineer', icon: '{ }', order: 2 },
  { id: 'creative', label: 'Creative', icon: '~', order: 3 },
  { id: 'arcade', label: 'Arcade', icon: '🕹', order: 4 },
];

export const designIds = designs.sort((a, b) => a.order - b.order).map((d) => d.id);
/** The world that opens the site: the first in order. */
export const defaultDesign = designIds[0];

/** The world after `id` in order, wrapping around. */
export const nextDesign = (id: string) => designIds[(designIds.indexOf(id) + 1) % designIds.length];
