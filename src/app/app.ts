import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  styleUrl: './app.scss',
  template: `
    <aside class="development-notice" aria-label="Application status">
      This app is in development. Current version is v0.2.9. Not connected to the cloud-backend yet.
    </aside>
    <router-outlet />
  `,
})
export class App {}
