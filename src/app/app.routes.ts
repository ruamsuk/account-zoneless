import { Routes } from '@angular/router';
import { canActivate, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

const redirectUnauthorizedToLogin = () =>
  redirectUnauthorizedTo(['auth/login']);
const redirectLoggedInToHome = () => redirectLoggedInTo(['/']);


export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    ...canActivate(redirectUnauthorizedToLogin),
    loadComponent: () => import('./features/welcome')
      .then(m => m.Welcome)
  },
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
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'financial-report',
    loadComponent: () => import('./pages/financial-report')
      .then(m => m.FinancialReport),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'annual-report',
    loadComponent: () => import('./pages/annual-report-')
      .then(m => m.AnnualReport),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'monthly-detail/:year/:month',
    loadComponent: () => import('./pages/monthly-detail-modal').then(m => m.MonthlyDetailModal),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'credit-report',
    loadComponent: () => import('./pages/credit-report')
      .then(m => m.CreditReport),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: '',
  }
];
