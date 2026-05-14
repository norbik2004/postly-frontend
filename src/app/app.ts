import { Component, signal } from '@angular/core';
import { Header } from './layout/header/header';

@Component({
  selector: 'app-root',
  imports: [Header],
  template: `
    <app-header />

    <main>
      <section
        id="top"
        class="page-section hero flex min-h-[70vh] flex-col justify-center gap-6 px-6 py-16 md:px-12 lg:px-16"
      >
        <p class="text-sm font-semibold uppercase tracking-widest text-[var(--mat-sys-primary)]">
          One-page experience
        </p>
        <h1 class="max-w-3xl text-4xl font-bold tracking-tight text-[var(--mat-sys-on-surface)] md:text-5xl">
          Hello, {{ title() }}
        </h1>
        <p class="max-w-2xl text-lg text-[var(--mat-sys-on-surface-variant)]">
          Use the header to jump between sections. Each block is a normal section with an
          <code class="rounded bg-[var(--mat-sys-surface-container)] px-1.5 py-0.5 text-sm">id</code>
          so anchors and keyboard navigation stay predictable.
        </p>
      </section>

      <section
        id="features"
        class="page-section border-t border-[var(--mat-sys-outline-variant)] px-6 py-20 md:px-12 lg:px-16"
      >
        <h2 class="text-2xl font-bold text-[var(--mat-sys-on-surface)]">Features</h2>
        <p class="mt-3 max-w-2xl text-[var(--mat-sys-on-surface-variant)]">
          Replace this placeholder with your real product highlights—cards, icons, or a grid work well here.
        </p>
        <ul class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          @for (item of featureItems; track item.title) {
            <li
              class="rounded-2xl border border-[var(--mat-sys-outline-variant)] bg-[var(--mat-sys-surface-container-low)] p-6 shadow-sm"
            >
              <h3 class="text-lg font-semibold text-[var(--mat-sys-on-surface)]">{{ item.title }}</h3>
              <p class="mt-2 text-sm text-[var(--mat-sys-on-surface-variant)]">{{ item.body }}</p>
            </li>
          }
        </ul>
      </section>

      <section
        id="about"
        class="page-section border-t border-[var(--mat-sys-outline-variant)] px-6 py-20 md:px-12 lg:px-16"
      >
        <h2 class="text-2xl font-bold text-[var(--mat-sys-on-surface)]">About</h2>
        <p class="mt-3 max-w-2xl text-[var(--mat-sys-on-surface-variant)]">
          Short story, team, or mission copy belongs in this band. Keeping sections tall enough makes scroll
          navigation feel natural on a single page.
        </p>
      </section>

      <section
        id="contact"
        class="page-section border-t border-[var(--mat-sys-outline-variant)] px-6 py-20 md:px-12 lg:px-16"
      >
        <h2 class="text-2xl font-bold text-[var(--mat-sys-on-surface)]">Contact</h2>
        <p class="mt-3 max-w-2xl text-[var(--mat-sys-on-surface-variant)]">
          Drop in a form, email, or social links when you are ready—the header already points here.
        </p>
      </section>
    </main>
  `,
  styles: [],
})
export class App {
  protected readonly title = signal('postly-frontend');

  protected readonly featureItems = [
    {
      title: 'Fast navigation',
      body: 'Header links scroll smoothly to each section using native scroll APIs.',
    },
    {
      title: 'Accessible anchors',
      body: 'Real href fragments plus focus-friendly styles keep keyboard users unblocked.',
    },
    {
      title: 'Material + Tailwind',
      body: 'Toolbar and tokens from Material; spacing and layout from your existing stack.',
    },
  ] as const;
}
