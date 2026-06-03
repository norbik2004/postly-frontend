import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
  imports: [RouterLink, RouterLinkActive],
  styleUrl: './dashboard-sidebar.scss',
  template: `
    <aside class="dashboard-sidebar" aria-label="Dashboard navigation">
      <p class="dashboard-sidebar__eyebrow">Workspace</p>
      <nav class="dashboard-sidebar__nav">
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
    </aside>
  `,
})
export class DashboardSidebar {
  protected readonly navItems = NAV_ITEMS;
}
