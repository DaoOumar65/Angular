import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () =>
      import('./components/auth/auth.component').then((m) => m.AuthComponent),
    canMatch: [guestGuard]
  },
  {
    path: '',
    loadComponent: () =>
      import('./components/layout/app-shell/app-shell.component').then(
        (m) => m.AppShellComponent
      ),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/pages/dashboard-page/dashboard-page.component').then(
            (m) => m.DashboardPageComponent
          )
      },
      {
        path: 'expenses',
        loadComponent: () =>
          import('./components/pages/expenses-page/expenses-page.component').then(
            (m) => m.ExpensesPageComponent
          )
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./components/analytics/analytics.component').then(
            (m) => m.AnalyticsComponent
          )
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./components/categories/categories.component').then(
            (m) => m.CategoriesComponent
          )
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./components/settings/settings.component').then(
            (m) => m.SettingsComponent
          )
      },
      {
        path: 'incomes',
        loadComponent: () =>
          import('./components/incomes/incomes.component').then(
            (m) => m.IncomesComponent
          )
      },
      {
        path: 'recurring',
        loadComponent: () =>
          import('./components/recurring-expenses/recurring-expenses.component').then(
            (m) => m.RecurringExpensesComponent
          )
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./components/notifications/notifications.component').then(
            (m) => m.NotificationsComponent
          )
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
