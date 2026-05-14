import { Component } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';

export interface NavLink {
  readonly id: string;
  readonly label: string;
}

@Component({
  selector: 'app-header',
  imports: [MatToolbar],
  styleUrl: './header.scss',
  template: `
    <mat-toolbar class="header-toolbar elevated">
      <a
        href="#top"
        class="brand"
        (click)="scrollTo($event, 'top')"
        aria-label="Postly — Home"
      >
        Postly
      </a>

      <span class="toolbar-spacer"></span>

      <nav class="header-nav" aria-label="Page sections">
        @for (link of links; track link.id) {
          <a
            [href]="'#' + link.id"
            class="nav-link"
            (click)="scrollTo($event, link.id)"
          >
            {{ link.label }}
          </a>
        }
      </nav>
    </mat-toolbar>
  `,
})
export class Header {
  protected readonly links: readonly NavLink[] = [
    { id: 'features', label: 'Features' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  scrollTo(event: Event, fragment: string): void {
    event.preventDefault();
    const el = document.getElementById(fragment);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `#${fragment}`);
  }
}
