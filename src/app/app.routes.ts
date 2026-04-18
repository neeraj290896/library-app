import { Routes } from '@angular/router';
import { AuthGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    },
    {
        path: 'signup',
        loadComponent: () => import('./pages/signup/signup.component').then(m => m.SignupComponent),
    },
    {
        path: '',
        loadComponent: () => import('./pages/layout/layout.component').then(m => m.LayoutComponent),
        // canActivate: [AuthGuard],
        children: [
            { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
            { path: 'books', loadComponent: () => import('./pages/books/books.component').then(m => m.BooksComponent) },
            { path: 'checkout', loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent) },
            { path: 'admin', loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent) },
            { path: 'settings', loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent) },
            { path: 'help', loadComponent: () => import('./pages/help/help.component').then(m => m.HelpComponent) },
        ]
    }
];
