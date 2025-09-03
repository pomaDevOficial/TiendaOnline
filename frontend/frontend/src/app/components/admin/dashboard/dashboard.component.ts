import { Component, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentaServicio } from '../../../services/Venta.service';
import { DetalleVentaServicio } from '../../../services/DetalleVenta.Service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ChartModule,
    CardModule,
    CalendarModule,
    DropdownModule,
    ButtonModule,
    SkeletonModule,
    TableModule,
    ChartModule
  ],
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Datos para gráficas
  ventasPorMesData: any;
  ventasPorMesOptions: any;
  productosMasVendidosData: any;
  productosMasVendidosOptions: any;

  // Filtros
  anioSeleccionado: number = new Date().getFullYear();
  mesSeleccionado: number | null = null;
  limiteProductos: number = 10;

  // Listas para filtros
  anios: number[] = [];
  meses: any[] = [
    { label: 'Todos los meses', value: null },
    { label: 'Enero', value: 1 },
    { label: 'Febrero', value: 2 },
    { label: 'Marzo', value: 3 },
    { label: 'Abril', value: 4 },
    { label: 'Mayo', value: 5 },
    { label: 'Junio', value: 6 },
    { label: 'Julio', value: 7 },
    { label: 'Agosto', value: 8 },
    { label: 'Septiembre', value: 9 },
    { label: 'Octubre', value: 10 },
    { label: 'Noviembre', value: 11 },
    { label: 'Diciembre', value: 12 }
  ];

  limites: any[] = [
    { label: 'Top 5', value: 5 },
    { label: 'Top 10', value: 10 },
    { label: 'Top 15', value: 15 },
    { label: 'Top 20', value: 20 }
  ];

  // Datos
  ventasMensuales: any[] = [];
  productosMasVendidos: any[] = [];

  // Loading states
  loadingVentas: boolean = true;
  loadingProductos: boolean = true;

  // Estadísticas
  totalVentas: number = 0;
  promedioMensual: number = 0;
  mesMejorVenta: string = '';
  productoMasVendido: string = '';

  constructor(
    private ventaService: VentaServicio,
    private detalleVentaService: DetalleVentaServicio
  ) {}

  ngOnInit() {
    this.generarListaAños();
    this.cargarDashboard();
  }

  generarListaAños() {
    const añoActual = new Date().getFullYear();
    for (let i = añoActual; i >= añoActual - 5; i--) {
      this.anios.push(i);
    }
  }

  cargarDashboard() {
    this.cargarVentasPorMes();
    this.cargarProductosMasVendidos();
  }

  cargarVentasPorMes() {
    this.loadingVentas = true;
    this.ventaService.getVentasPorMes(this.anioSeleccionado, this.mesSeleccionado || undefined).subscribe({
      next: (response: any) => {
        this.ventasMensuales = Array.isArray(response) ? response : response?.data || [];
        this.calcularEstadisticasVentas();
        this.inicializarGraficaVentas();
        this.loadingVentas = false;
      },
      error: (err) => {
        console.error('Error al cargar ventas por mes', err);
        this.loadingVentas = false;
      }
    });
  }

  cargarProductosMasVendidos() {
    this.loadingProductos = true;
    this.detalleVentaService.getProductosMasVendidos(this.anioSeleccionado, this.mesSeleccionado || undefined, this.limiteProductos).subscribe({
      next: (response: any) => {
        this.productosMasVendidos = Array.isArray(response) ? response : response?.data || [];
        this.inicializarGraficaProductos();
        this.loadingProductos = false;
      },
      error: (err) => {
        console.error('Error al cargar productos más vendidos', err);
        this.loadingProductos = false;
      }
    });
  }

  calcularEstadisticasVentas() {
    this.totalVentas = this.ventasMensuales.reduce((sum, item) => sum + (item.total || 0), 0);
    this.promedioMensual = this.ventasMensuales.length > 0 ? this.totalVentas / this.ventasMensuales.length : 0;
    
    const mejorMes = this.ventasMensuales.reduce((max, item) => 
      (item.total > max.total) ? item : max, { total: 0, mes: '' }
    );
    this.mesMejorVenta = mejorMes.mes || 'N/A';
  }

  inicializarGraficaVentas() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    const meses = this.ventasMensuales.map(item => item.mes);
    const totales = this.ventasMensuales.map(item => item.total);

    this.ventasPorMesData = {
      labels: meses,
      datasets: [
        {
          label: 'Ventas por Mes',
          data: totales,
          fill: false,
          borderColor: documentStyle.getPropertyValue('--primary-500'),
          tension: 0.4,
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          borderWidth: 2
        }
      ]
    };

    this.ventasPorMesOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        },
        title: {
          display: true,
          text: `Ventas Mensuales - ${this.anioSeleccionado}`,
          color: textColor,
          font: {
            size: 16,
            weight: 'bold'
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };
  }

  inicializarGraficaProductos() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    const productos = this.productosMasVendidos.map(item => item.producto);
    const cantidades = this.productosMasVendidos.map(item => item.cantidad_vendida);

    // Encontrar el producto más vendido
    const productoTop = this.productosMasVendidos[0];
    this.productoMasVendido = productoTop ? `${productoTop.producto} (${productoTop.cantidad_vendida} unidades)` : 'N/A';

    this.productosMasVendidosData = {
      labels: productos,
      datasets: [
        {
          label: 'Unidades Vendidas',
          data: cantidades,
          backgroundColor: [
            documentStyle.getPropertyValue('--primary-500'),
            documentStyle.getPropertyValue('--primary-400'),
            documentStyle.getPropertyValue('--primary-300'),
            documentStyle.getPropertyValue('--primary-200'),
            documentStyle.getPropertyValue('--primary-100'),
            documentStyle.getPropertyValue('--blue-500'),
            documentStyle.getPropertyValue('--green-500'),
            documentStyle.getPropertyValue('--yellow-500'),
            documentStyle.getPropertyValue('--cyan-500'),
            documentStyle.getPropertyValue('--pink-500')
          ],
          borderColor: documentStyle.getPropertyValue('--surface-border'),
          borderWidth: 1
        }
      ]
    };

    this.productosMasVendidosOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: textColor
          }
        },
        title: {
          display: true,
          text: `Productos Más Vendidos - ${this.anioSeleccionado}`,
          color: textColor,
          font: {
            size: 16,
            weight: 'bold'
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };
  }

  aplicarFiltros() {
    this.cargarVentasPorMes();
    this.cargarProductosMasVendidos();
  }

  limpiarFiltros() {
    this.anioSeleccionado = new Date().getFullYear();
    this.mesSeleccionado = null;
    this.limiteProductos = 10;
    this.aplicarFiltros();
  }

  // Y agrega estos métodos para los cálculos de porcentaje:
getProgressWidth(producto: any): string {
  const maxValue = this.productosMasVendidos[0]?.cantidad_vendida || 1;
  return `${(producto.cantidad_vendida / maxValue) * 100}%`;
}

getProgressPercentage(producto: any): number {
  const maxValue = this.productosMasVendidos[0]?.cantidad_vendida || 1;
  return (producto.cantidad_vendida / maxValue) * 100;
}

}