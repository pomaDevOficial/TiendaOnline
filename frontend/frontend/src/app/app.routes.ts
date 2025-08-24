import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/admin/dashboard/dashboard.component';
import { AuthGuard } from './services/auth.guard';
import { LoginGuard } from './services/login.guard';
import { TallaComponent } from './components/admin/talla/talla.component';
import { CategoriaComponent } from './components/admin/categoria/categoria.component';
import { MarcaComponent } from './components/admin/marca/marca.component';
import { HomeComponent } from './components/client/home/home.component';

export const routes: Routes = [
  // Login
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  
  {
    path: 'Admin',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: DashboardComponent },  // ruta master
      { path: 'inventario/talla', component: TallaComponent },
      { path: 'inventario/categoria', component: CategoriaComponent },
      { path: 'inventario/marca', component: MarcaComponent },
      // Si la ruta hija no existe → redirigir a master de Admin
      { path: '**', redirectTo: '', pathMatch: 'full' }
    ]
  },

{
    path: 'cliente',
    children: [
      { path: '', component: HomeComponent },              // /cliente → Home
      // Cualquier ruta desconocida dentro de cliente → redirige a /cliente
      { path: '**', redirectTo: '', pathMatch: 'full' }    
    ]
  },
    // Redirección raíz → si no hay ruta, ir a Login o Admin según necesidad
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  { path: '**', redirectTo: '/login', pathMatch: 'full' }

];
