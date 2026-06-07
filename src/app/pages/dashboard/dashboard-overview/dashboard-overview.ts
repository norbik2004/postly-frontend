import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-overview',
  styleUrl: './dashboard-overview.scss',
  template: `
    <section class="dashboard-panel" aria-labelledby="dashboard-overview-title">
      <p class="section-eyebrow">Dashboard</p>
      <h1 id="dashboard-overview-title" class="dashboard-panel__title">Welcome to Starvia</h1>
      <p class="dashboard-panel__copy">
        You are logged in. Content for this area loads from child routes — add pages under
        <code>/dashboard</code> and wire API calls in each view component.
      </p>
    </section>
  `,
})
export class DashboardOverview {}
