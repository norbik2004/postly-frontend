import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero',
  imports: [RouterLink],
  styleUrl: './hero.scss',
  template: `
    <section id="top" class="page-section hero">
      <div class="hero-bg" aria-hidden="true">
        <span class="hero-blob hero-blob--1"></span>
        <span class="hero-blob hero-blob--2"></span>
        <span class="hero-blob hero-blob--3"></span>
      </div>

      <div class="hero-inner">
        <div class="hero-layout">
          <div class="hero-copy">
            <p class="section-eyebrow">{{ eyebrow }}</p>
            <h1 class="hero-title t-display">{{ heading ?? 'Create posts that connect with ' + title }}</h1>
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
export class Hero {
  @Input() title = 'Postly';
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
  @Input() customPanel = false;
  @Input() panelCaption = 'Postly product preview';
  @Input() panelIcon = '▣';
  @Input() panelLabel = 'Product preview';
  @Input() panelHint = 'App screenshot or hero illustration';
}
