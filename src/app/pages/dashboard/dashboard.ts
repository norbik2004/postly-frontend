import { Component, inject, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { Header } from '../../layout/header/header';
import { DashboardSidebar } from './dashboard-sidebar/dashboard-sidebar';

@Component({
  selector: 'app-dashboard-page',
  imports: [Header, DashboardSidebar, RouterOutlet],
  styleUrl: './dashboard.scss',
  template: `
    <app-header
      [links]="[]"
      actionLabel="Home"
      actionRoute="/"
      navLabel="Dashboard navigation"
      brandMode="route"
      brandRoute="/dashboard"
    />

    <div class="dashboard-layout">
      <app-dashboard-sidebar class="dashboard-layout__sidebar" />
      <main class="dashboard-layout__main">
        <div class="dashboard-layout__backdrop" aria-hidden="true"></div>
        <div class="dashboard-layout__content">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
})
export class DashboardPage implements OnDestroy {
  private readonly router = inject(Router);
  private readonly navSub: Subscription = this.router.events
    .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
    .subscribe((event) => {
      if (event.urlAfterRedirects.startsWith('/dashboard')) {
        window.scrollTo(0, 0);
      }
    });

  ngOnDestroy(): void {
    this.navSub.unsubscribe();
  }
}
