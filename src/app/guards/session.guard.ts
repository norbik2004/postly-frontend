import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { SessionService } from '../services/session';

export type SessionGuardMode = 'auth' | 'guest';

export type SessionGuardConfig = {
  /**
   * - `auth`: only logged-in users can access the route (otherwise redirect).
   * - `guest`: only logged-out users can access the route (otherwise redirect).
   */
  mode: SessionGuardMode;
  /**
   * Optional override for where to redirect when access is denied.
   * Defaults:
   * - `auth`  -> `/login`
   * - `guest` -> `/dashboard`
   */
  redirectTo?: string;
};

function readConfig(route: Parameters<CanActivateFn>[0]): SessionGuardConfig {
  const dataValue = route.data?.['session'];
  if (dataValue && typeof dataValue === 'object' && 'mode' in dataValue) {
    return dataValue as SessionGuardConfig;
  }

  // Safe default: treat missing config as "auth required".
  return { mode: 'auth' };
}

export const sessionGuard: CanActivateFn = (route) => {
  const session = inject(SessionService);
  const router = inject(Router);
  const config = readConfig(route);

  const defaultRedirect = config.mode === 'auth' ? '/login' : '/dashboard';
  const redirectTo = config.redirectTo ?? defaultRedirect;

  return session.checkOnce().pipe(
    map((isLoggedIn) => {
      const allowed = config.mode === 'auth' ? isLoggedIn : !isLoggedIn;
      return allowed ? true : router.createUrlTree([redirectTo]);
    })
  );
};

