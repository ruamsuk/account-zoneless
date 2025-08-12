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
    path: 'cash-list',
    pathMatch: 'full',
    ...canActivate(redirectUnauthorizedToLogin),
    loadComponent: () => import('./pages/cash-list/cash-list')
      .then(m => m.CashList)
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
    path: 'profile',
    loadComponent: () => import('./pages/profile')
      .then(m => m.Profile),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'financial-report', // month and detail
    loadComponent: () => import('./pages/cash-monthly-report')
      .then(m => m.CashMonthlyReport),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'date-range',
    loadComponent: () => import('./features/reports/date-range-report')
      .then(m => m.DateRangeReport),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'annual-report',  // year
    loadComponent: () => import('./pages/cash-annual-report')
      .then(m => m.CashAnnualReport),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'monthly-detail/:year/:month',  // month detail modal
    loadComponent: () => import('./pages/monthly-detail-modal').then(m => m.MonthlyDetailModal),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'credit',
    ...canActivate(redirectUnauthorizedToLogin),
    children: [
      {
        path: 'list',
        loadComponent: () => import('./pages/credit-list')
          .then(m => m.CreditList)
      },
      {
        path: 'report',
        loadComponent: () => import('./pages/credit-report')
          .then(m => m.CreditReport),
      },
      {
        path: 'credit-annual-report',
        loadComponent: () => import('./pages/credit-annual-report')
          .then(m => m.CreditAnnualReport),
      },
    ]
  },
  {
    path: 'blood',
    ...canActivate(redirectUnauthorizedToLogin),
    children: [
      {
        path: 'list',
        loadComponent: () => import('./pages/blood/blood-list')
          .then(m => m.BloodList)
      },
      {
        path: 'period',
        loadComponent: () => import('./pages/blood/blood-period')
          .then(m => m.BloodPeriod)
      },
      {
        path: 'print-dialog',
        loadComponent: () => import('./pages/blood/print-dialog')
          .then(m => m.PrintDialog)
      },
    ]
  },
  {
    path: 'monthly',
    ...canActivate(redirectUnauthorizedToLogin),
    loadComponent: () => import('./pages/monthly/monthly-list')
      .then(m => m.MonthlyList)
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
