export type FeatureStar = {
  id: number;
  x: number;
  y: number;
  size: number;
  depth: number;
  shape: 'dot' | 'star';
  opacity: number;
  driftDuration: number;
  driftDelay: number;
  driftX: number;
  driftY: number;
  twinkleDuration: number;
};

const GRID_COLS = 12;
const GRID_ROWS = 16;

function createStar(id: number, x: number, y: number): FeatureStar {
  const driftSign = () => (Math.random() > 0.5 ? 1 : -1);

  return {
    id,
    x,
    y,
    size: Math.random() * 2 + 1.2,
    depth: Math.random() * 0.75 + 0.25,
    shape: Math.random() > 0.62 ? 'star' : 'dot',
    opacity: Math.random() * 0.38 + 0.48,
    driftDuration: Math.random() * 5 + 3.5,
    driftDelay: Math.random() * -14,
    driftX: driftSign() * (Math.random() * 14 + 10),
    driftY: driftSign() * (Math.random() * 14 + 10),
    twinkleDuration: Math.random() * 2 + 1.5,
  };
}

/** Even coverage across the full features section, plus a few random extras. */
export function createFeatureStars(): FeatureStar[] {
  const stars: FeatureStar[] = [];
  let id = 0;
  const cellW = 100 / GRID_COLS;
  const cellH = 100 / GRID_ROWS;

  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      if (Math.random() > 0.68) {
        continue;
      }

      stars.push(
        createStar(
          id++,
          col * cellW + Math.random() * cellW,
          row * cellH + Math.random() * cellH
        )
      );
    }
  }

  const extraCount = 42;
  for (let i = 0; i < extraCount; i++) {
    stars.push(createStar(id++, Math.random() * 96 + 2, Math.random() * 96 + 2));
  }

  return stars;
}
