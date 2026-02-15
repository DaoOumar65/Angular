import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.hasToken()) {
    return router.createUrlTree(['/auth']);
  }

  return authService.refreshCurrentUser().then(() => {
    return authService.isAuthenticated() ? true : router.createUrlTree(['/auth']);
  });
};

export const guestGuard: CanMatchFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.hasToken()) {
    return true;
  }

  return authService.refreshCurrentUser().then(() => {
    return authService.isAuthenticated() ? router.createUrlTree(['/dashboard']) : true;
  });
};
