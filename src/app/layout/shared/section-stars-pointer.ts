import { signal } from '@angular/core';
import { getNearStarIds, nearStarSetsEqual, type SectionStar } from './section-stars';

const HOVER_CAPABLE =
  typeof matchMedia !== 'undefined' && matchMedia('(hover: hover) and (pointer: fine)').matches;

export function createSectionStarsInteraction(stars: readonly SectionStar[]) {
  const nearStarIds = signal<ReadonlySet<number>>(new Set());
  const visible = signal(true);

  let rafId = 0;
  let pendingEvent: MouseEvent | null = null;
  let sectionEl: HTMLElement | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let intersectionObserver: IntersectionObserver | null = null;

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

    const nextNear = getNearStarIds(stars, rect, event.clientX, event.clientY);
    if (!nearStarSetsEqual(nextNear, nearStarIds())) {
      nearStarIds.set(nextNear);
    }
  }

  function onPointerMove(event: MouseEvent): void {
    if (!HOVER_CAPABLE || !visible()) {
      return;
    }

    pendingEvent = event;
    if (rafId !== 0) {
      return;
    }

    rafId = requestAnimationFrame(flushPointerUpdate);
  }

  function onPointerLeave(): void {
    pendingEvent = null;
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

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        if (nearStarIds().size > 0) {
          nearStarIds.set(new Set());
        }
      });
      resizeObserver.observe(section);
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
    resizeObserver?.disconnect();
    resizeObserver = null;
    sectionEl = null;
  }

  function destroy(): void {
    destroyObservers();
    nearStarIds.set(new Set());
    visible.set(true);
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
