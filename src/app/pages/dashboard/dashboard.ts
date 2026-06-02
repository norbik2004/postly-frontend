import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
        <router-outlet />
      </main>
    </div>
  `,
})
export class DashboardPage {}
