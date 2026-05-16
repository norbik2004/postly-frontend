import { Component, HostListener, OnDestroy, signal } from '@angular/core';

const LINKS = [
  { id: 'features', label: 'Features' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
] as const;

@Component({
  selector: 'app-header',
  styleUrl: './header.scss',
  template: `
    <header class="site-header" [class.is-scrolled]="scrolled()">
      <div class="header-bar">
        <a href="#top" class="brand" (click)="go($event, 'top')">
          <span class="brand__icon-wrap">
            <img
              class="brand__icon"
              src="/postly-icon.svg"
              alt=""
              width="32"
              height="32"
              decoding="async"
            />
          </span>
          <span class="brand__name">Postly</span>
        </a>

        <button
          type="button"
          class="menu-toggle"
          [attr.aria-expanded]="menuOpen()"
          aria-controls="site-nav"
          (click)="toggleMenu()"
        >
          <span class="sr-only">{{ menuOpen() ? 'Close menu' : 'Open menu' }}</span>
          <span class="menu-icon" [class.is-open]="menuOpen()" aria-hidden="true"></span>
        </button>

        <nav
          id="site-nav"
          class="nav"
          [class.is-open]="menuOpen()"
          aria-label="Sections"
        >
          <div class="nav-drawer-head">
            <button
              type="button"
              class="nav-close"
              aria-label="Close menu"
              (click)="closeMenu()"
            >
              <span class="close-icon" aria-hidden="true"></span>
            </button>
          </div>
          @for (link of links; track link.id) {
            <a [href]="'#' + link.id" class="nav-link" (click)="go($event, link.id)">
              {{ link.label }}
            </a>
          }
        </nav>
      </div>

      @if (menuOpen()) {
        <button
          type="button"
          class="nav-backdrop"
          aria-label="Close menu"
          (click)="closeMenu()"
        ></button>
      }
    </header>
  `,
})
export class Header implements OnDestroy {
  protected readonly links = LINKS;
  protected readonly menuOpen = signal(false);
  protected readonly scrolled = signal(false);

  private readonly onScroll = (): void => {
    this.scrolled.set(window.scrollY > 12);
  };

  constructor() {
    this.onScroll();
    window.addEventListener('scroll', this.onScroll, { passive: true });
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.closeMenu();
  }

  protected toggleMenu(): void {
    this.setMenuOpen(!this.menuOpen());
  }

  protected closeMenu(): void {
    this.setMenuOpen(false);
  }

  protected go(event: Event, id: string): void {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
    history.replaceState(null, '', `#${id}`);
    this.closeMenu();
  }

  private setMenuOpen(open: boolean): void {
    this.menuOpen.set(open);
    document.body.classList.toggle('nav-open', open);
  }
}
