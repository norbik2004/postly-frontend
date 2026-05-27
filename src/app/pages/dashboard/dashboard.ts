import { Component } from '@angular/core';
import { Header } from '../../layout/header/header';

@Component({
  selector: 'app-dashboard-page',
  imports: [Header],
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

    <main class="dashboard-shell">
      <section class="dashboard-card" aria-labelledby="dashboard-title">
        <p class="section-eyebrow">Dashboard</p>
        <h1 id="dashboard-title" class="dashboard-title">Welcome to Postly</h1>
        <p class="dashboard-copy">
          You are logged in. This is a simple dashboard placeholder for the next authenticated
          features.
        </p>
      </section>
    </main>
  `,
})
export class DashboardPage {}
