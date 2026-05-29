import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { createHeroStars } from '../shared/section-stars';
import { createSectionStarsInteraction } from '../shared/section-stars-pointer';

@Component({
  selector: 'app-hero',
  imports: [RouterLink],
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.hero-host--fill]': 'fillViewport',
  },
  template: `
    <section
      id="top"
      class="page-section hero"
      [class.hero--fill-viewport]="fillViewport"
      (mousemove)="starsInteraction.onPointerMove($event)"
      (mouseleave)="starsInteraction.onPointerLeave()"
    >
      <div class="hero-bg" aria-hidden="true">
        <div
          class="hero-stars section-stars"
          [class.section-stars--idle]="!starsInteraction.visible()"
        >
          @for (star of stars; track star.id) {
            <span
              class="section-star"
              [class.section-star--near]="starsInteraction.nearStarIds().has(star.id)"
              [class.section-star--glyph]="star.shape === 'star'"
              [style]="star.style"
            >
              <span class="section-star__body"></span>
            </span>
          }
        </div>
        <div class="hero-ground-glow"></div>
        <span class="hero-blob hero-blob--1"></span>
        <span class="hero-blob hero-blob--2"></span>
        <span class="hero-blob hero-blob--3"></span>
        <span class="hero-grid" aria-hidden="true"></span>
      </div>

      <div class="hero-inner">
        <div class="hero-layout">
          <div class="hero-copy">
            <p class="hero-eyebrow">
              <span class="hero-eyebrow__dot" aria-hidden="true"></span>
              {{ eyebrow }}
            </p>
            <h1 class="hero-title t-display">
              @if (heading) {
                {{ heading }}
              } @else {
                Create posts that <span class="hero-title__accent">connect</span> with {{ title }}
              }
            </h1>
            <p class="hero-lead t-body">{{ description }}</p>
            @if (showActions) {
              <div class="hero-actions">
                @if (primaryActionRoute; as route) {
                  <a [routerLink]="route" class="btn btn--primary">{{ primaryActionLabel }}</a>
                } @else {
                  <a [href]="primaryActionHref" class="btn btn--primary">{{ primaryActionLabel }}</a>
                }

                @if (secondaryActionRoute; as route) {
                  <a [routerLink]="route" class="btn btn--secondary">{{ secondaryActionLabel }}</a>
                } @else if (secondaryActionHref; as href) {
                  <a [href]="href" class="btn btn--secondary">{{ secondaryActionLabel }}</a>
                }
              </div>
            }
            <ng-content select="[hero-copy-extra]" />
          </div>

          <figure class="media-frame media-frame--hero">
            <figcaption class="sr-only">{{ panelCaption }}</figcaption>
            @if (customPanel) {
              <ng-content select="[hero-panel]" />
            } @else {
              <div class="media-slot" aria-hidden="true">
                <span class="media-slot__icon" aria-hidden="true">{{ panelIcon }}</span>
                <p class="media-slot__label">{{ panelLabel }}</p>
                <p class="media-slot__hint">{{ panelHint }}</p>
              </div>
            }
          </figure>
        </div>
      </div>
    </section>
  `,
})
export class Hero implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);

  protected readonly stars = createHeroStars();
  protected readonly starsInteraction = createSectionStarsInteraction(this.stars);

  @Input() title = 'ContentForge';
  @Input() eyebrow = 'Social content, elevated';
  @Input() heading: string | null = null;
  @Input() description =
    'Plan, write, and publish engaging social content in one place with AI that sparks ideas, sharpens your message, and saves your team hours every week.';
  @Input() showActions = true;
  @Input() primaryActionLabel = 'Explore features';
  @Input() primaryActionHref = '#features';
  @Input() primaryActionRoute: string | null = null;
  @Input() secondaryActionLabel = 'Log in';
  @Input() secondaryActionRoute: string | null = '/login';
  @Input() secondaryActionHref: string | null = null;
  @Input() fillViewport = false;
  @Input() customPanel = false;
  @Input() panelCaption = 'ContentForge product preview';
  @Input() panelIcon = '▣';
  @Input() panelLabel = 'Product preview';
  @Input() panelHint = 'App screenshot or hero illustration';

  ngAfterViewInit(): void {
    const section = this.host.nativeElement.querySelector('section');
    if (section instanceof HTMLElement) {
      this.starsInteraction.attach(section);
    }
  }

  ngOnDestroy(): void {
    this.starsInteraction.destroy();
  }
}
