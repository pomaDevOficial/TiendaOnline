import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputNumberModule } from 'primeng/inputnumber';
import { BadgeModule } from 'primeng/badge';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService, ConfirmationService } from 'primeng/api';

import { ProductoServicio } from '../../../services/producto.service';
import { VentaServicio } from '../../../services/Venta.service';
import { DetalleVentaServicio } from '../../../services/DetalleVenta.Service';
import { MetodoPagoServicio } from '../../../services/MetodoPago.service';
import { PersonaServicio } from '../../../services/persona.service';
import { LoteTallaServicio } from '../../../services/LoteTalla.service';
import { ComprobanteServicio } from '../../../services/Comprobante.service';
import { Producto, Persona, MetodoPago, Venta, DetalleVenta, LoteTalla } from '../../../interfaces/interfaces.interface';

interface CartItem {
  id: number;
  loteTalla: any; // El lote_talla seleccionado con toda su información
  cantidad: number;
  precio: number; // El precio ya viene del lote_talla
  subtotal: number;
}

@Component({
  selector: 'app-venta',
  templateUrl: './venta.component.html',
  styleUrls: ['./venta.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TableModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    AutoCompleteModule,
    InputNumberModule,
    BadgeModule,
    DividerModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService, ConfirmationService]
})
export class VentaComponent implements OnInit {
  // Catálogo de productos disponibles (con lotes_talla)
  catalogoProductos: any[] = [];
  catalogoFiltrado: any[] = [];

  // Tallas disponibles para el producto seleccionado
  tallasDisponibles: any[] = [];

  // Carrito de compras
  cartItems: CartItem[] = [];
  cartTotal: number = 0;

  // Cliente seleccionado
  clienteSeleccionado: Persona | null = null;
  clientes: Persona[] = [];
  clientesFiltrados: Persona[] = [];

  // Método de pago
  metodoPagoSeleccionado: MetodoPago | null = null;
  metodosPago: MetodoPago[] = [];

  // Estados de carga
  loadingProductos: boolean = false;
  loadingClientes: boolean = false;
  loadingMetodosPago: boolean = false;
  guardandoVenta: boolean = false;

  // Diálogos
  mostrarDialogProducto: boolean = false;
  mostrarDialogCliente: boolean = false;

  // Producto y talla seleccionados para agregar al carrito
  productoSeleccionado: any = null; // Producto del catálogo
  tallaSeleccionada: any = null; // Talla específica con precio
  cantidadProducto: number = 1;

  constructor(
    private productoService: ProductoServicio,
    private ventaService: VentaServicio,
    private detalleVentaService: DetalleVentaServicio,
    private metodoPagoService: MetodoPagoServicio,
    private personaService: PersonaServicio,
    private loteTallaService: LoteTallaServicio,
    private comprobanteService: ComprobanteServicio,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.inicializarArrays();
    this.cargarProductos();
    this.cargarClientes();
    this.cargarMetodosPago();
  }

  inicializarArrays() {
    this.catalogoProductos = [];
    this.catalogoFiltrado = [];
    this.tallasDisponibles = [];
    this.clientes = [];
    this.clientesFiltrados = [];
    this.metodosPago = [];
    this.cartItems = [];
  }

  // Cargar datos iniciales
  cargarProductos() {
    this.loadingProductos = true;
    // Usar la ruta GET /api/v1/lotetallas/catalogo con filtros para obtener productos disponibles
    // Parámetros disponibles: estado, stock, idcategoria, idmarca, etc.
    this.loteTallaService.getProductosDisponibles({
      estado: 'disponible',
      stock: 'con_stock'
    }).subscribe({
      next: (response: any) => {
        this.catalogoProductos = Array.isArray(response) ? response : response?.data || [];
        this.loadingProductos = false;
      },
      error: (error) => {
        console.error('Error al cargar catálogo de productos:', error);
        // Intentar con la ruta alternativa
        this.cargarProductosAlternativo();
      }
    });
  }

  // Método alternativo usando la ruta GET /api/v1/lotetallas/catalogo/talla
  cargarProductosAlternativo() {
    this.loteTallaService.getProductosDisponiblesPorTalla().subscribe({
      next: (response: any) => {
        this.catalogoProductos = Array.isArray(response) ? response : response?.data || [];
        this.loadingProductos = false;
      },
      error: (error) => {
        console.error('Error al cargar catálogo alternativo:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los productos disponibles'
        });
        this.loadingProductos = false;
      }
    });
  }

  cargarClientes() {
    this.loadingClientes = true;
    this.personaService.getPersonas().subscribe({
      next: (response: any) => {
        this.clientes = Array.isArray(response) ? response : response?.data || [];
        this.loadingClientes = false;
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los clientes'
        });
        this.loadingClientes = false;
      }
    });
  }

  cargarMetodosPago() {
    this.loadingMetodosPago = true;
    this.metodoPagoService.getMetodosPago().subscribe({
      next: (response: any) => {
        this.metodosPago = Array.isArray(response) ? response : response?.data || [];
        this.loadingMetodosPago = false;
      },
      error: (error) => {
        console.error('Error al cargar métodos de pago:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los métodos de pago'
        });
        this.loadingMetodosPago = false;
      }
    });
  }

  // Método para cargar tallas disponibles cuando se selecciona un producto
  // Usa la ruta GET /api/v1/lotetallas/tallas con parámetros: idproducto, estado, stock
  cargarTallasDisponibles(productoId: number) {
    this.loteTallaService.getTallasDisponibles({
      productoId: productoId,
      estado: 'disponible',
      stock: 'con_stock'
    }).subscribe({
      next: (response: any) => {
        //this.tallasDisponibles = Array.isArray(response) ? response : response?.data || [];
        this.tallasDisponibles = (Array.isArray(response) ? response : response?.data || [])
        .map((item: any) => ({
          ...item,
          talla: item.Talla?.nombre // 🔹 agregamos un alias "talla"
        }));

        // Ordenar tallas por precio ascendente
        this.tallasDisponibles.sort((a, b) => a.precioventa - b.precioventa);
      },
      error: (error) => {
        console.error('Error al cargar tallas disponibles:', error);
        this.tallasDisponibles = [];
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'No se pudieron cargar las tallas disponibles para este producto'
        });
      }
    });
  }

  // Método para verificar stock antes de agregar al carrito
  // Usa la ruta GET /api/v1/lotetallas/stock con parámetros: id, cantidad
  verificarStockDisponible(loteTallaId: number, cantidad: number): Observable<boolean> {
    return this.loteTallaService.verificarStock({ loteTallaId: loteTallaId, cantidad: cantidad }).pipe(
      map((response: any) => {
        return response?.data.disponible || false;
      }),
      catchError(() => {
        return of(false);
      })
    );
  }

  // Método alternativo para cargar catálogo usando la ruta /catalogo/talla
  cargarCatalogoAlternativo() {
    this.loteTallaService.getProductosDisponiblesPorTalla().subscribe({
      next: (response: any) => {
        // Este método podría devolver datos en un formato diferente
        console.log('Catálogo alternativo:', response);
      },
      error: (error) => {
        console.error('Error al cargar catálogo alternativo:', error);
      }
    });
  }

  // Funciones de búsqueda y filtrado
  filtrarProductos(event: any) {
    const query = event.query.toLowerCase();
    this.catalogoFiltrado = this.catalogoProductos.filter((item: any) =>
      item.nombre?.toLowerCase().includes(query) ||
      item.marca?.nombre?.toLowerCase().includes(query) ||
      item.categoria?.nombre?.toLowerCase().includes(query)
    );
  }

  filtrarClientes(event: any) {
    const query = event.query.toLowerCase();
    this.clientesFiltrados = this.clientes.filter(cliente =>
      cliente.nombres?.toLowerCase().includes(query) ||
      cliente.apellidos?.toLowerCase().includes(query) ||
      cliente.correo?.toLowerCase().includes(query)
    );
  }

  // Funciones del carrito
  abrirDialogProducto() {
    this.productoSeleccionado = null;
    this.tallaSeleccionada = null;
    this.cantidadProducto = 1;
    this.tallasDisponibles = [];
    this.mostrarDialogProducto = true;
  }

  // Método para manejar cuando se selecciona un producto
  onProductoSeleccionado(event: any) {
    if (event) {
      this.productoSeleccionado = event.value;
      console.log(event)
      this.cargarTallasDisponibles(event.value.producto_id);
    } else {
      this.productoSeleccionado = null;
      this.tallasDisponibles = [];
      this.tallaSeleccionada = null;
    }
  }

  agregarProductoAlCarrito() {
    if (!this.productoSeleccionado || !this.tallaSeleccionada || this.cantidadProducto <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Seleccione producto, talla y cantidad'
      });
      return;
    }

    // Verificar stock usando el servicio del backend
    this.verificarStockDisponible(this.tallaSeleccionada.id, this.cantidadProducto).subscribe({
      next: (stockDisponible) => {
        console.log(stockDisponible)
        if (!stockDisponible) {
          this.messageService.add({
            severity: 'error',
            summary: 'Stock insuficiente',
            detail: `No hay suficiente stock disponible para ${this.tallaSeleccionada.talla}`
          });
          return;
        }

        // Verificación adicional con el stock local
        if (this.cantidadProducto > this.tallaSeleccionada.stock) {
          this.messageService.add({
            severity: 'error',
            summary: 'Stock insuficiente',
            detail: `Solo hay ${this.tallaSeleccionada.stock} unidades disponibles`
          });
          return;
        }

        const subtotal = this.cantidadProducto * this.tallaSeleccionada.preciocosto;
        const cartItem: CartItem = {
          id: Date.now(),
          loteTalla: this.tallaSeleccionada,
          cantidad: this.cantidadProducto,
          precio: this.tallaSeleccionada.preciocosto,
          subtotal: subtotal
        };

        this.cartItems.push(cartItem);
        this.calcularTotal();
        this.mostrarDialogProducto = false;

        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `${this.productoSeleccionado.nombre} - ${this.tallaSeleccionada.talla} agregado al carrito`
        });
      },
      error: (error) => {
        console.error('Error al verificar stock:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo verificar el stock disponible'
        });
      }
    });
  }

  eliminarDelCarrito(item: CartItem) {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar ${item.loteTalla.nombre} - ${item.loteTalla.talla} del carrito?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.cartItems = this.cartItems.filter(cartItem => cartItem.id !== item.id);
        this.calcularTotal();
        this.messageService.add({
          severity: 'info',
          summary: 'Eliminado',
          detail: `${item.loteTalla.nombre} - ${item.loteTalla.talla} eliminado del carrito`
        });
      }
    });
  }

  calcularTotal() {
    this.cartTotal = this.cartItems.reduce((total, item) => total + item.subtotal, 0);
  }

  vaciarCarrito() {
    this.confirmationService.confirm({
      message: '¿Está seguro de vaciar el carrito?',
      header: 'Confirmar vaciado',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.cartItems = [];
        this.cartTotal = 0;
        this.messageService.add({
          severity: 'info',
          summary: 'Carrito vaciado',
          detail: 'Todos los productos han sido eliminados del carrito'
        });
      }
    });
  }

  // Método para refrescar datos
  refrescarDatos() {
    this.inicializarArrays();
    this.cargarProductos();
    this.cargarClientes();
    this.cargarMetodosPago();

    this.messageService.add({
      severity: 'info',
      summary: 'Actualizando',
      detail: 'Recargando datos del sistema...'
    });
  }

  // Funciones de venta
  guardarVenta() {
    if (this.cartItems.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Agregue al menos un producto al carrito'
      });
      return;
    }

    if (!this.clienteSeleccionado) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Seleccione un cliente'
      });
      return;
    }

    if (!this.metodoPagoSeleccionado) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Seleccione un método de pago'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `¿Confirmar venta por S/ ${this.cartTotal.toFixed(2)} (${this.getTotalItems()} items)?`,
      header: 'Confirmar venta',
      icon: 'pi pi-shopping-cart',
      accept: () => {
        this.procesarVenta();
      }
    });
  }

  procesarVenta() {
    this.guardandoVenta = true;
    const idusuario = localStorage.getItem("idusuario");
    // Preparar datos para la venta completa usando POST /api/v1/comprobantes/venta-completa
    const ventaData = {
      cliente: this.clienteSeleccionado,
      metodoPago: this.metodoPagoSeleccionado,
      idusuario : idusuario,
      productos: this.cartItems.map(item => ({
        loteTalla: item.loteTalla,
        cantidad: item.cantidad,
        precio: item.precio,
        subtotal: item.subtotal
      })),
      total: this.cartTotal
    };

    // Usar el servicio de venta completa con comprobante
    this.comprobanteService.crearVentaCompletaConComprobante(ventaData).subscribe({
      next: (response) => {
        this.guardandoVenta = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Venta realizada',
          detail: `Venta por S/ ${this.cartTotal.toFixed(2)} registrada exitosamente`
        });

        // Limpiar formulario
        this.limpiarFormulario();
      },
      error: (error) => {
        console.error('Error al procesar venta:', error);
        this.guardandoVenta = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo procesar la venta. Intente nuevamente.'
        });
      }
    });
  }

  limpiarFormulario() {
    this.cartItems = [];
    this.cartTotal = 0;
    this.clienteSeleccionado = null;
    this.metodoPagoSeleccionado = null;
    this.productoSeleccionado = null;
    this.tallaSeleccionada = null;
    this.cantidadProducto = 1;
    this.tallasDisponibles = [];
  }

  // Funciones de utilidad
  getNombreCompletoCliente(cliente: Persona): string {
    return `${cliente.nombres || ''} ${cliente.apellidos || ''}`.trim();
  }

  getTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.cantidad, 0);
  }
}
