import { Component } from '@angular/core';
import { Footer } from '../../layout/footer/footer';
import { Header } from '../../layout/header/header';
import { Hero } from '../../layout/hero/hero';
import { Features } from '../../layout/features/features';

@Component({
  selector: 'app-home-page',
  imports: [Header, Hero, Features, Footer],
  styleUrl: './home.scss',
  template: `
    <app-header />
    <app-hero [title]="title" />
    <main>
      <app-features />

      <section id="about" class="page-section content-section">
        <div class="section-inner">
          <header class="section-header">
            <p class="section-eyebrow">About</p>
            <h2 class="section-title">Built for modern social teams</h2>
            <p class="section-lead">
              Postly helps creators and marketers plan content, collaborate with AI, and publish with
              confidence so every post earns attention.
            </p>
          </header>
          <figure class="media-frame media-frame--section">
            <figcaption class="sr-only">Team or product story image</figcaption>
            <div class="media-slot" aria-hidden="true">
              <span class="media-slot__icon" aria-hidden="true">◎</span>
              <p class="media-slot__label">About Postly</p>
              <p class="media-slot__hint">Team photo, illustration, or brand story visual</p>
            </div>
          </figure>
        </div>
      </section>

      <section id="contact" class="page-section content-section">
        <div class="section-inner">
          <header class="section-header">
            <p class="section-eyebrow">Contact</p>
            <h2 class="section-title">Let's talk</h2>
            <p class="section-lead">
              Questions about Postly or early access? Reach out and we'll get back to you soon.
            </p>
          </header>
        </div>
      </section>
    </main>
    <app-footer />
  `,
})
export class HomePage {
  protected readonly title = 'Postly';
}
