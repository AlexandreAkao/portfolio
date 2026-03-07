export interface DesignConfig {
  id: string;
  label: string;
  icon: string;
  order: number;
}

export const designs: DesignConfig[] = [
  { id: 'engineer', label: 'Engineer', icon: '{ }', order: 0 },
  { id: 'creative', label: 'Creative', icon: '~', order: 1 },
  { id: 'avantgarde', label: 'Avant-garde', icon: '//', order: 2 },
  { id: 'editorial', label: 'Editorial', icon: '01', order: 3 },
];

export const designIds = designs.sort((a, b) => a.order - b.order).map((d) => d.id);
export const defaultDesign = designIds[0];
