import { Component } from '@angular/core';

const FOOTER_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
] as const;

const FOOTER_HIGHLIGHTS = [
  'AI-assisted drafts',
  'Approval workflows',
  'Multi-channel scheduling',
] as const;

@Component({
  selector: 'app-footer',
  styleUrl: './footer.scss',
  template: `
    <footer class="site-footer">
      <div class="footer-shell">
        <div class="footer-grid">
          <section class="footer-brand" aria-labelledby="footer-brand-title">
            <a href="#top" class="brand" aria-label="Go to top">
              <span class="brand__icon-wrap">
                <img
                  class="brand__icon"
                  src="/starvia-logo.png"
                  alt=""
                  width="44"
                  height="44"
                  decoding="async"
                />
              </span>
              <span id="footer-brand-title" class="brand__name">Starvia</span>
            </a>

            <p class="footer-copy">
              Plan, draft, approve, and publish social content from one calm workspace built for
              modern marketing teams.
            </p>

            <ul class="highlight-list" aria-label="Starvia highlights">
              @for (highlight of highlights; track highlight) {
                <li class="highlight-chip">{{ highlight }}</li>
              }
            </ul>
          </section>

          <nav class="footer-column" aria-labelledby="footer-nav-title">
            <p id="footer-nav-title" class="footer-heading">Navigate</p>
            @for (link of links; track link.href) {
              <a class="footer-link" [href]="link.href">{{ link.label }}</a>
            }
          </nav>

          <section class="footer-column" aria-labelledby="footer-contact-title">
            <p id="footer-contact-title" class="footer-heading">Contact</p>
            <a class="footer-link" href="mailto:hello@starvia.pl">hello@starvia.pl</a>
            <p class="footer-meta">Reply time: within one business day</p>
            <a
              class="footer-link footer-link--strong"
              href="mailto:hello@starvia.pl?subject=Starvia%20demo%20request"
            >
              Book a demo
            </a>
          </section>

          <section class="footer-column footer-column--cta" aria-labelledby="footer-cta-title">
            <p id="footer-cta-title" class="footer-heading">Why teams choose Starvia</p>
            <p class="footer-meta">
              Keep strategy, approvals, and publishing in one place so campaigns move faster with
              less back-and-forth.
            </p>
          </section>
        </div>

        <div class="footer-bottom">
          <p>&copy; {{ currentYear }} Starvia. Built for modern social teams.</p>
          <p>Remote-first support for creators, marketers, and growing brands.</p>
        </div>
      </div>
    </footer>
  `,
})
export class Footer {
  protected readonly links = FOOTER_LINKS;
  protected readonly highlights = FOOTER_HIGHLIGHTS;
  protected readonly currentYear = new Date().getFullYear();
}
