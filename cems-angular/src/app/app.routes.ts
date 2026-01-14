import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/public/landing/landing').then(m => m.LandingComponent)
    },
    {
        path: 'events',
        loadComponent: () => import('./features/public/events/events.component').then(m => m.EventsComponent)
    },
    {
        path: 'events/:id',
        loadComponent: () => import('./features/public/event-details/event-details.component').then(m => m.EventDetailsComponent)
    },
    {
        path: 'clubs',
        loadComponent: () => import('./features/public/clubs/clubs.component').then(m => m.ClubsComponent)
    },
    {
        path: 'venues',
        loadComponent: () => import('./features/public/venues/venues.component').then(m => m.VenuesComponent)
    },
    {
        path: 'login',
        loadComponent: () => import('./features/public/login/login').then(m => m.LoginComponent)
    },
    {
        path: 'signup',
        loadComponent: () => import('./features/public/signup/signup').then(m => m.SignupComponent)
    },
    {
        path: 'profile',
        loadComponent: () => import('./features/student/profile/profile').then(m => m.ProfileComponent),
        canActivate: [authGuard]
    },
    {
        path: 'admin',
        loadComponent: () => import('./features/admin/admin-layout/admin-layout').then(m => m.AdminLayoutComponent),
        canActivate: [authGuard],
        data: { role: 'admin' },
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                loadComponent: () => import('./features/admin/dashboard-overview/dashboard-overview').then(m => m.DashboardOverviewComponent)
            },
            {
                path: 'users',
                loadComponent: () => import('./features/admin/user-management/user-management').then(m => m.UserManagementComponent)
            },
            {
                path: 'resources',
                loadComponent: () => import('./features/admin/resource-management/resource-management').then(m => m.ResourceManagementComponent)
            }
        ]
    },
    {
        path: 'organizer',
        loadComponent: () => import('./features/organizer/organizer-layout/organizer-layout').then(m => m.OrganizerLayoutComponent),
        canActivate: [authGuard],
        data: { role: 'organizer' },
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                loadComponent: () => import('./features/organizer/event-management/event-management').then(m => m.EventManagementComponent)
            },
            {
                path: 'create-event',
                loadComponent: () => import('./features/organizer/create-event/create-event').then(m => m.CreateEventComponent)
            },
            {
                path: 'scanner',
                loadComponent: () => import('./features/organizer/qr-scanner/qr-scanner').then(m => m.QrScannerComponent)
            }
        ]
    },
    { path: '**', redirectTo: '' }
];
