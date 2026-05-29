export type SectionStar = {
  id: number;
  x: number;
  y: number;
  shape: 'dot' | 'star';
  style: Record<string, string>;
};

export type SectionStarsConfig = {
  gridCols: number;
  gridRows: number;
  skipProbability: number;
  extraCount: number;
  minY: number;
  maxY: number;
};

export const SECTION_STAR_NEAR_RADIUS_PX = 168;

const DEFAULT_CONFIG: SectionStarsConfig = {
  gridCols: 10,
  gridRows: 13,
  skipProbability: 0.74,
  extraCount: 26,
  minY: 0,
  maxY: 100,
};

const HERO_CONFIG: SectionStarsConfig = {
  gridCols: 9,
  gridRows: 11,
  skipProbability: 0.72,
  extraCount: 22,
  minY: 32,
  maxY: 98,
};

function createStar(id: number, x: number, y: number): SectionStar {
  const driftSign = () => (Math.random() > 0.5 ? 1 : -1);
  const size = Math.random() * 2 + 1.2;
  const opacity = Math.random() * 0.38 + 0.48;
  const driftDuration = Math.random() * 5 + 3.5;
  const driftDelay = Math.random() * -14;
  const driftX = driftSign() * (Math.random() * 14 + 10);
  const driftY = driftSign() * (Math.random() * 14 + 10);
  const twinkleDuration = Math.random() * 2 + 1.5;

  return {
    id,
    x,
    y,
    shape: Math.random() > 0.78 ? 'star' : 'dot',
    style: {
      left: `${x}%`,
      top: `${y}%`,
      '--star-size': `${size}px`,
      '--star-opacity': String(opacity),
      '--drift-duration': `${driftDuration}s`,
      '--drift-delay': `${driftDelay}s`,
      '--drift-x': `${driftX}px`,
      '--drift-y': `${driftY}px`,
      '--twinkle-duration': `${twinkleDuration}s`,
    },
  };
}

function clampY(y: number, minY: number, maxY: number): number {
  return Math.min(maxY, Math.max(minY, y));
}

export function createSectionStars(config: Partial<SectionStarsConfig> = {}): SectionStar[] {
  const { gridCols, gridRows, skipProbability, extraCount, minY, maxY } = {
    ...DEFAULT_CONFIG,
    ...config,
  };
  const stars: SectionStar[] = [];
  let id = 0;
  const cellW = 100 / gridCols;
  const cellH = 100 / gridRows;

  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      if (Math.random() > skipProbability) {
        continue;
      }

      stars.push(
        createStar(
          id++,
          col * cellW + Math.random() * cellW,
          clampY(row * cellH + Math.random() * cellH, minY, maxY)
        )
      );
    }
  }

  for (let i = 0; i < extraCount; i++) {
    stars.push(
      createStar(
        id++,
        Math.random() * 96 + 2,
        clampY(Math.random() * 96 + 2, minY, maxY)
      )
    );
  }

  return stars;
}

export function createFeatureStars(): SectionStar[] {
  return createSectionStars();
}

export function createHeroStars(): SectionStar[] {
  return createSectionStars(HERO_CONFIG);
}

export function getNearStarIds(
  stars: readonly SectionStar[],
  rect: DOMRect,
  mouseX: number,
  mouseY: number,
  radiusPx = SECTION_STAR_NEAR_RADIUS_PX
): Set<number> {
  const radiusSq = radiusPx ** 2;
  const near = new Set<number>();

  for (const star of stars) {
    const starX = rect.left + (star.x / 100) * rect.width;
    const starY = rect.top + (star.y / 100) * rect.height;
    const dx = mouseX - starX;
    const dy = mouseY - starY;

    if (dx * dx + dy * dy <= radiusSq) {
      near.add(star.id);
    }
  }

  return near;
}

export function nearStarSetsEqual(
  nextNear: ReadonlySet<number>,
  currentNear: ReadonlySet<number>
): boolean {
  if (nextNear.size !== currentNear.size) {
    return false;
  }

  for (const id of nextNear) {
    if (!currentNear.has(id)) {
      return false;
    }
  }

  return true;
}
