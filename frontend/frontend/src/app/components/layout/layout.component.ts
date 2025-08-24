import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { PanelMenuModule, PanelMenuSub } from 'primeng/panelmenu'; 
import { MenubarModule } from 'primeng/menubar'; 
import { ButtonModule } from 'primeng/button'; 
import { MenuModule } from 'primeng/menu';
import { SidebarModule } from 'primeng/sidebar';
import { Menu } from 'primeng/menu';
import { ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-layout',
   imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatSidenavModule,
    MatListModule
    
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
   sidebarVisible: boolean = false;

  // DECLARA LA PROPIEDAD AQUÍ
  menuLateral: { label: string; icon: string; link: string }[] = [];
   constructor(private router: Router) {

   }
  ngOnInit() {
  this.menuLateral = [
    { label: 'Dashboard', icon: 'dashboard', link: '/dashboard' },
    { label: 'Productos', icon: 'inventory', link: '/productos' },
    { label: 'Pedidos', icon: 'shopping_cart', link: '/pedidos' },
  ];
  }

  logout() {
    console.log('Cerrando sesión...');
      this.router.navigate(['/login']);
  }
}
