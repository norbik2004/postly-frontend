import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, shareReplay, tap } from 'rxjs';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly authService = inject(AuthService);

  readonly loggedIn = signal(false);
  readonly checked = signal(false);

  private check$?: Observable<boolean>;

  /**
   * Runs the `/me` (session) check at most once per app lifecycle (until `refresh()` or `setLoggedOut()`).
   * Every subscriber observes the same result via replay.
   */
  checkOnce(): Observable<boolean> {
    if (!this.check$) {
      this.check$ = this.authService.getSession().pipe(
        map(() => true),
        catchError(() => of(false)),
        tap((isLoggedIn) => {
          this.loggedIn.set(isLoggedIn);
          this.checked.set(true);
        }),
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }

    return this.check$;
  }

  /**
   * Forces a new `/me` check and updates shared state.
   */
  refresh(): Observable<boolean> {
    this.check$ = undefined;
    return this.checkOnce();
  }

  /**
   * Clears session state locally after logout.
   */
  setLoggedOut(): void {
    this.loggedIn.set(false);
    this.checked.set(true);
    this.check$ = of(false).pipe(shareReplay({ bufferSize: 1, refCount: false }));
  }
}

