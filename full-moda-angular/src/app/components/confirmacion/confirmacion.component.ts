import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

interface Pedido {
  id: string;
  fecha: string;
  cliente: {
    nombre: string;
    email: string;
    telefono: string;
    metodoPago: string;
  };
  productos: any[];
  total: number;
  estado: string;
}

@Component({
  selector: 'app-confirmacion',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './confirmacion.component.html',
  styleUrl: './confirmacion.component.scss'
})
export class ConfirmacionComponent implements OnInit {
  pedido: Pedido | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarPedido();
  }

  private cargarPedido(): void {
    // Obtener el ID del pedido desde los parámetros de la URL
    const pedidoId = this.route.snapshot.queryParams['pedido'];

    if (!pedidoId) {
      // Si no hay ID de pedido, redirigir al catálogo
      this.router.navigate(['/catalog']);
      return;
    }

    // Cargar datos del pedido desde localStorage
    const pedidoGuardado = localStorage.getItem('ultimoPedido');
    if (pedidoGuardado) {
      try {
        this.pedido = JSON.parse(pedidoGuardado);
      } catch (error) {
        console.error('Error loading pedido from storage:', error);
        this.router.navigate(['/catalog']);
      }
    } else {
      // Si no hay pedido guardado, redirigir al catálogo
      this.router.navigate(['/catalog']);
    }
  }

  getMetodoPagoTexto(metodo?: string): string {
    if (!metodo) return 'No especificado';
    switch (metodo) {
      case 'tarjeta':
        return 'Tarjeta de Crédito/Débito';
      case 'yape':
        return 'Yape';
      case 'plin':
        return 'Plin';
      case 'transferencia':
        return 'Transferencia Bancaria';
      default:
        return metodo;
    }
  }

  getFechaFormateada(fecha?: string): string {
    if (!fecha) return new Date().toLocaleDateString('es-ES');
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return new Date().toLocaleDateString('es-ES');
    }
  }

  getSubtotal(): number {
    if (!this.pedido) return 0;
    return this.pedido.productos.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
  }

  getShipping(): number {
    return 0; // Sin costo de envío
  }

  printOrder(): void {
    window.print();
  }
}
