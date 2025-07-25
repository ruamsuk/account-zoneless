import { Routes } from '@angular/router';
import { canActivate, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { adminGuard } from './features/auth/admin-guard';

const redirectUnauthorizedToLogin = () =>
  redirectUnauthorizedTo(['auth/login']);
const redirectLoggedInToHome = () => redirectLoggedInTo(['/']);


export const routes: Routes = [
  {
    path: 'dashboard',
    pathMatch: 'full',
    ...canActivate(redirectUnauthorizedToLogin),
    loadComponent: () => import('./features/dashboard/dashboard')
      .then(m => m.Dashboard)
  },
  {
    path: 'auth',
    ...canActivate(redirectLoggedInToHome),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login')
          .then(m => m.Login)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password')
          .then(m => m.ForgotPassword)
      }
    ]
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password')
      .then(m => m.ForgotPassword)
  },
  {
    path: 'reports/date-range',
    loadComponent: () => import('./features/reports/date-range-report')
      .then(m => m.DateRangeReport),
    canActivate: [adminGuard]
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  }
];
