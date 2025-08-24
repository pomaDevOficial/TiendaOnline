import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/admin/dashboard/dashboard.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
     {
        path: 'Admin',
        component: LayoutComponent,
        children: [
        { path: 'dashboard', component: DashboardComponent },
        ]
    },
    { path: '', redirectTo: '/login', pathMatch: 'full' },

    { path: '**', redirectTo: 'login', pathMatch: 'full' },
];
