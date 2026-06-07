import { Component, inject, signal } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { getUserInitials, type UserAccount } from '../../../models/user-account';
import { AuthService } from '../../../services/auth';
import { SessionService } from '../../../services/session';

type DashboardNavItem = {
  label: string;
  route: string;
  exact?: boolean;
};

const NAV_ITEMS: readonly DashboardNavItem[] = [
  { label: 'Overview', route: '/dashboard', exact: true },
  { label: 'Posts', route: '/dashboard/posts' },
  { label: 'Prompts', route: '/dashboard/prompts' },
] as const;

@Component({
  selector: 'app-dashboard-sidebar',
  imports: [RouterLink, RouterLinkActive, MatTooltip],
  styleUrl: './dashboard-sidebar.scss',
  template: `
    <aside class="dashboard-sidebar" aria-label="Dashboard">
      <div class="dashboard-sidebar__body">
        <a routerLink="/dashboard" class="dashboard-sidebar__brand" aria-label="ContentForge dashboard">
          <span class="dashboard-sidebar__brand-icon-wrap">
            <img
              class="dashboard-sidebar__brand-icon"
              src="/postly-icon.svg"
              alt=""
              width="32"
              height="32"
              decoding="async"
            />
          </span>
          <span class="dashboard-sidebar__brand-name">ContentForge</span>
        </a>

        <p class="dashboard-sidebar__eyebrow">Workspace</p>
        <nav class="dashboard-sidebar__nav" aria-label="Dashboard navigation">
          <ul class="dashboard-sidebar__list">
            @for (item of navItems; track item.route) {
              <li>
                <a
                  [routerLink]="item.route"
                  routerLinkActive="is-active"
                  [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
                  class="dashboard-sidebar__link"
                >
                  {{ item.label }}
                </a>
              </li>
            }
          </ul>
        </nav>
      </div>

      <div class="dashboard-sidebar__footer">
        <div class="dashboard-sidebar__user-row">
          <span class="dashboard-sidebar__avatar" aria-hidden="true">{{ userInitials() }}</span>
          <div class="dashboard-sidebar__identity">
            <span class="dashboard-sidebar__name">{{ account()?.userName ?? 'Account' }}</span>
            @if (account()?.email; as email) {
              <span class="dashboard-sidebar__email">{{ email }}</span>
            }
          </div>
          <button
            type="button"
            class="dashboard-sidebar__notifications"
            aria-label="Notifications"
            matTooltip="Notifications"
            matTooltipPosition="below"
          >
            <span class="material-icons dashboard-sidebar__notifications-icon" aria-hidden="true">
              notifications
            </span>
          </button>
        </div>

        <div class="dashboard-sidebar__user-actions">
          <a routerLink="/dashboard/account" class="dashboard-sidebar__action">Account</a>
          <button
            type="button"
            class="dashboard-sidebar__action dashboard-sidebar__action--danger"
            [disabled]="isLoggingOut()"
            (click)="logout()"
          >
            {{ isLoggingOut() ? 'Logging out…' : 'Log out' }}
          </button>
        </div>
      </div>
    </aside>
  `,
})
export class DashboardSidebar {
  private readonly authService = inject(AuthService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  protected readonly navItems = NAV_ITEMS;
  protected readonly account = signal<UserAccount | null>(null);
  protected readonly isLoggingOut = signal(false);

  constructor() {
    this.session.checkOnce().subscribe((loggedIn) => {
      if (loggedIn) {
        this.loadAccount();
      }
    });
  }

  protected userInitials(): string {
    const userName = this.account()?.userName;
    return userName ? getUserInitials(userName) : '?';
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
        this.account.set(null);
        void this.router.navigateByUrl('/login');
      });
  }

  private loadAccount(): void {
    this.authService.getAccount().subscribe({
      next: (profile) => this.account.set(profile),
      error: () => this.account.set(null),
    });
  }
}
