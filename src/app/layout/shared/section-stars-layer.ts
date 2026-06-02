import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { SectionStar } from './section-stars';

@Component({
  selector: 'app-section-stars-layer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'section-stars',
    '[class.section-stars--idle]': '!visible()',
    'aria-hidden': 'true',
  },
  template: `
    @for (star of stars(); track star.id) {
      <span
        class="section-star"
        [class.section-star--near]="nearIds().has(star.id)"
        [class.section-star--glyph]="star.glyph"
        [attr.style]="star.style"
      ></span>
    }
  `,
})
export class SectionStarsLayer {
  readonly stars = input.required<readonly SectionStar[]>();
  readonly nearIds = input.required<ReadonlySet<number>>();
  readonly visible = input.required<boolean>();
}
