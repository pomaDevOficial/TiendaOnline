import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CatalogComponent } from './components/catalog/catalog.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { ConfirmacionComponent } from './components/confirmacion/confirmacion.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'catalog', component: CatalogComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'confirmacion', component: ConfirmacionComponent },
  { path: '**', redirectTo: '' }
];
