import { signal } from '@angular/core';
import { getNearStarIds, type SectionStar } from './section-stars';

const HOVER_CAPABLE =
  typeof matchMedia !== 'undefined' && matchMedia('(hover: hover) and (pointer: fine)').matches;

const POINTER_MOVE_EPSILON_SQ = 16;

export function createSectionStarsInteraction(
  stars: readonly SectionStar[] | (() => readonly SectionStar[])
) {
  const getStars = typeof stars === 'function' ? stars : () => stars;
  const nearStarIds = signal<ReadonlySet<number>>(new Set());
  const visible = signal(true);

  let rafId = 0;
  let pendingEvent: MouseEvent | null = null;
  let sectionEl: HTMLElement | null = null;
  let intersectionObserver: IntersectionObserver | null = null;
  let lastClientX = 0;
  let lastClientY = 0;

  function flushPointerUpdate(): void {
    rafId = 0;
    const event = pendingEvent;
    pendingEvent = null;

    if (!event || !sectionEl) {
      return;
    }

    const rect = sectionEl.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return;
    }

    const nextNear = getNearStarIds(getStars(), rect, event.clientX, event.clientY);
    const currentNear = nearStarIds();

    if (nextNear.size !== currentNear.size) {
      nearStarIds.set(nextNear);
      return;
    }

    for (const id of nextNear) {
      if (!currentNear.has(id)) {
        nearStarIds.set(nextNear);
        return;
      }
    }
  }

  function onPointerMove(event: MouseEvent): void {
    if (!HOVER_CAPABLE || !visible()) {
      return;
    }

    const dx = event.clientX - lastClientX;
    const dy = event.clientY - lastClientY;
    if (dx * dx + dy * dy < POINTER_MOVE_EPSILON_SQ) {
      return;
    }

    lastClientX = event.clientX;
    lastClientY = event.clientY;
    pendingEvent = event;

    if (rafId !== 0) {
      return;
    }

    rafId = requestAnimationFrame(flushPointerUpdate);
  }

  function onPointerLeave(): void {
    pendingEvent = null;
    lastClientX = 0;
    lastClientY = 0;

    if (rafId !== 0) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }

    if (nearStarIds().size === 0) {
      return;
    }

    nearStarIds.set(new Set());
  }

  function attach(section: HTMLElement): void {
    if (sectionEl === section) {
      return;
    }

    destroyObservers();
    sectionEl = section;

    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          visible.set(entry.isIntersecting);
          if (!entry.isIntersecting && nearStarIds().size > 0) {
            nearStarIds.set(new Set());
          }
        },
        { rootMargin: '10% 0px' }
      );
      intersectionObserver.observe(section);
    }
  }

  function destroyObservers(): void {
    pendingEvent = null;
    if (rafId !== 0) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }

    intersectionObserver?.disconnect();
    intersectionObserver = null;
    sectionEl = null;
  }

  function destroy(): void {
    destroyObservers();
    nearStarIds.set(new Set());
    visible.set(true);
    lastClientX = 0;
    lastClientY = 0;
  }

  return {
    nearStarIds,
    visible,
    attach,
    onPointerMove,
    onPointerLeave,
    destroy,
  };
}
