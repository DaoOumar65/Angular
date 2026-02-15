import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { StorageService } from '../services/storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService);
  const router = inject(Router);
  const token = storageService.getItem('auth_token');
  const isAuthRequest = req.url.includes('/auth/login') || req.url.includes('/auth/register');

  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (error?.status === 401 && !isAuthRequest) {
        storageService.removeItem('auth_token');
        storageService.removeItem('currentUser');
        storageService.removeItem('categories_cache');
        storageService.removeItem('budget_cache');
        storageService.removeItem('expenses_cache');
        void router.navigateByUrl('/auth');
      }

      return throwError(() => error);
    })
  );
};
