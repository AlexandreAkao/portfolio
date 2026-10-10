export interface DesignConfig {
  id: string;
  label: string;
  icon: string;
  order: number;
}

export const designs: DesignConfig[] = [
  { id: 'avantgarde', label: 'Avant-garde', icon: '//', order: 0 },
  { id: 'engineer', label: 'Engineer', icon: '{ }', order: 1 },
  { id: 'creative', label: 'Creative', icon: '~', order: 2 },
  { id: 'editorial', label: 'Editorial', icon: '01', order: 3 },
  { id: 'arcade', label: 'Arcade', icon: '🕹', order: 4 },
];

export const designIds = designs.sort((a, b) => a.order - b.order).map((d) => d.id);
export const defaultDesign = designIds[0];
