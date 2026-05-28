import { Component, HostListener, Input, OnDestroy, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { catchError, filter, finalize, of } from 'rxjs';
import { AuthService } from '../../services/auth';
import { SessionService } from '../../services/session';

type HeaderLink = {
  id: string;
  label: string;
};

const LINKS: readonly HeaderLink[] = [
  { id: 'features', label: 'Features' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
] as const;

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  styleUrl: './header.scss',
  template: `
    <header class="site-header" [class.is-scrolled]="scrolled()">
      <div class="header-bar">
        @if (brandMode === 'route') {
          <a [routerLink]="brandRoute" class="brand" aria-label="Go to ContentForge home" (click)="closeMenu()">
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
            <span class="brand__name">ContentForge</span>
          </a>
        } @else {
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
            <span class="brand__name">ContentForge</span>
          </a>
        }

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
          [attr.aria-label]="navLabel"
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
          @if (session.loggedIn()) {
            @if (isHomeRoute()) {
              <a [routerLink]="'/dashboard'" class="btn btn--secondary" (click)="closeMenu()">Dashboard</a>
            } @else {
              <button type="button" class="btn btn--secondary" (click)="logout()">
                Log out
              </button>
            }
          } @else {
            <a [routerLink]="actionRoute" class="btn btn--secondary" (click)="closeMenu()">
              {{ actionLabel }}
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
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly session = inject(SessionService);

  @Input() links: readonly HeaderLink[] = LINKS;
  @Input() actionLabel = 'Log in';
  @Input() actionRoute = '/login';
  @Input() navLabel = 'Sections';
  @Input() brandMode: 'scroll' | 'route' = 'scroll';
  @Input() brandRoute = '/';
  protected readonly menuOpen = signal(false);
  protected readonly scrolled = signal(false);
  protected readonly isLoggingOut = signal(false);
  protected readonly isHomeRoute = signal(false);

  private readonly onScroll = (): void => {
    this.scrolled.set(window.scrollY > 12);
  };

  constructor() {
    this.onScroll();
    window.addEventListener('scroll', this.onScroll, { passive: true });
    this.session.checkOnce().subscribe();

    this.isHomeRoute.set(this.router.url === '/' || this.router.url === '');
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.isHomeRoute.set(this.router.url === '/' || this.router.url === '');
    });
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

  protected logout(): void {
    this.isLoggingOut.set(true);
    this.authService
      .logout()
      .pipe(
        catchError(() => of(null)),
        finalize(() => this.isLoggingOut.set(false))
      )
      .subscribe(() => {
        this.session.setLoggedOut();
        this.closeMenu();
        void this.router.navigateByUrl('/login');
      });
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
