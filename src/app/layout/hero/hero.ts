import { Component, input } from '@angular/core';

@Component({
  selector: 'app-hero',
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
            <p class="section-eyebrow">Social content, elevated</p>
            <h1 class="hero-title t-display">Create posts that connect with {{ title() }}</h1>
            <p class="hero-lead t-body">
              Plan, write, and publish engaging social content in one place—with AI that sparks
              ideas, sharpens your message, and saves your team hours every week.
            </p>
            <div class="hero-actions">
              <a href="#features" class="btn btn--primary">Explore features</a>
              <a href="#contact" class="btn btn--secondary">Get in touch</a>
            </div>
          </div>

          <figure class="media-frame media-frame--hero">
            <figcaption class="sr-only">Postly product preview</figcaption>
            <div class="media-slot" aria-hidden="true">
              <span class="media-slot__icon" aria-hidden="true">▣</span>
              <p class="media-slot__label">Product preview</p>
              <p class="media-slot__hint">App screenshot or hero illustration</p>
            </div>
          </figure>
        </div>
      </div>
    </section>
  `,
})
export class Hero {
  readonly title = input('Postly');
}
