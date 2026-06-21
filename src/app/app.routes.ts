import { Routes } from '@angular/router';
import { expiredGuard } from './shared/guards/expired.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {
        path: '',
        loadComponent: () => import('./pages/login-layout/login-layout.component').then(m => m.LoginLayoutComponent),
        children: [
            {
                path: 'login',
                loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
                canActivate: [expiredGuard]
            },
            {
                path: 'signup',
                loadComponent: () => import('./pages/signup/signup.component').then(m => m.SignupComponent),
                canActivate: [expiredGuard]
            },
            {
                path: 'expired',
                loadComponent: () => import('./pages/expired/expired.component').then(m => m.ExpiredComponent)
            },
        ]
    },
    {
        path: '',
        loadComponent: () => import('./pages/layout/layout.component').then(m => m.LayoutComponent),
        canActivate: [expiredGuard],
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'books',
                loadComponent: () => import('./pages/books/books.component').then(m => m.BooksComponent)
            },
            {
                path: 'transactions',
                loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent)
            },
            {
                path: 'admin',
                loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent)
            },
            {
                path: 'settings',
                loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent)
            },
            {
                path: 'help',
                loadComponent: () => import('./pages/help/help.component').then(m => m.HelpComponent)
            },
        ]
    }
];
