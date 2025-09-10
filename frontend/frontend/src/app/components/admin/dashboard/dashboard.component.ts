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
    TableModule
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
  totalTransacciones: number = 0;
  totalIngresos: number = 0;
  promedioVentasMensual: number = 0;
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
        this.ventasMensuales = response?.data || [];
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
        this.productosMasVendidos = response?.data || [];
        this.calcularEstadisticasProductos();
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
    // Calcular total de transacciones (número de ventas)
    this.totalTransacciones = this.ventasMensuales.reduce((sum, item) => sum + (item.cantidad || 0), 0);
    
    // Calcular total de ingresos (monto total de ventas)
    this.totalIngresos = this.ventasMensuales.reduce((sum, item) => sum + (item.total || 0), 0);
    
    // Calcular promedio mensual de ventas (número de transacciones)
    this.promedioVentasMensual = this.ventasMensuales.length > 0 ? this.totalTransacciones / this.ventasMensuales.length : 0;
    
    // Encontrar el mes con mejor venta (por cantidad de transacciones)
    const mejorMes = this.ventasMensuales.reduce((max, item) => 
      ((item.cantidad || 0) > (max.cantidad || 0)) ? item : max, { cantidad: 0, mes: '' }
    );
    
    // Formatear el mes para mostrar
    if (mejorMes.mes) {
      if (mejorMes.mes.includes('-')) {
        const partes = mejorMes.mes.split('-');
        const numeroMes = parseInt(partes[1]);
        const nombresMeses = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        this.mesMejorVenta = `${nombresMeses[numeroMes - 1] || mejorMes.mes} (${mejorMes.cantidad || 0} ventas)`;
      } else {
        this.mesMejorVenta = `${mejorMes.mes} (${mejorMes.cantidad || 0} ventas)`;
      }
    } else {
      this.mesMejorVenta = 'N/A';
    }
  }

  calcularEstadisticasProductos() {
    // Obtener el producto más vendido (por cantidad)
    const productoTop = this.productosMasVendidos[0];
    this.productoMasVendido = productoTop ? 
      `${productoTop.producto.nombre} (${productoTop.cantidadVendida} unidades)` : 'N/A';
  }

  inicializarGraficaVentas() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color') || '#495057';
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#6c757d';
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#dee2e6';

    // Obtener nombres de meses formateados
    const meses = this.ventasMensuales.map(item => {
      if (item.mes && item.mes.includes('-')) {
        const partes = item.mes.split('-');
        const numeroMes = parseInt(partes[1]);
        const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return nombresMeses[numeroMes - 1] || item.mes;
      }
      return item.mes;
    });
    
    // Datos para transacciones (cantidad)
    const transacciones = this.ventasMensuales.map(item => item.cantidad || 0);

    this.ventasPorMesData = {
      labels: meses,
      datasets: [
        {
          label: 'Número de Ventas',
          data: transacciones,
          fill: true,
          borderColor: documentStyle.getPropertyValue('--primary-500') || '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.2)',
          tension: 0.4,
          borderWidth: 2
        }
      ]
    };

    this.ventasPorMesOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: textColor,
            font: {
              size: 12
            }
          }
        },
        title: {
          display: true,
          text: `Ventas Mensuales - ${this.anioSeleccionado}`,
          color: textColor,
          font: {
            size: 16,
            weight: 'bold'
          },
          padding: {
            top: 10,
            bottom: 20
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
            font: {
              size: 11
            },
            maxRotation: 0,
            minRotation: 0,
            padding: 5
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: textColorSecondary,
            font: {
              size: 11
            },
            padding: 5,
            stepSize: 1
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
  const textColor = documentStyle.getPropertyValue('--text-color') || '#495057';
  const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#6c757d';
  const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#dee2e6';

  // Verificar que hay datos
  if (!this.productosMasVendidos || this.productosMasVendidos.length === 0) {
    this.productosMasVendidosData = {
      labels: ['Sin datos'],
      datasets: [{
        label: 'Sin datos disponibles',
        data: [0],
        backgroundColor: ['#e9ecef']
      }]
    };
    
    this.productosMasVendidosOptions = {
      responsive: true,
      maintainAspectRatio: false
    };
    
    return;
  }

  const productos = this.productosMasVendidos.map(item => item.producto?.nombre || 'Sin nombre');
  const cantidades = this.productosMasVendidos.map(item => item.cantidadVendida || 0);

  // Colores dinámicos
  const colores = [
    '#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
    '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1'
  ];

  this.productosMasVendidosData = {
    labels: productos,
    datasets: [
      {
        label: 'Unidades Vendidas',
        data: cantidades,
        backgroundColor: colores.slice(0, productos.length),
        borderColor: '#ffffff',
        borderWidth: 1
      }
    ]
  };

  this.productosMasVendidosOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y', // Esto hace que las barras sean horizontales
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: textColor,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: `Top ${this.productosMasVendidos.length} Productos - ${this.anioSeleccionado}`,
        color: textColor,
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          color: textColorSecondary,
          font: {
            size: 11
          },
          stepSize: 1
        },
        grid: {
          color: surfaceBorder,
          drawBorder: false
        },
        title: {
          display: true,
          text: 'Cantidad Vendida',
          color: textColor,
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      y: {
        ticks: {
          color: textColorSecondary,
          font: {
            size: 11
          }
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

  // Métodos para cálculos de porcentaje en la tabla
  getProgressWidth(producto: any): string {
    const maxValue = this.productosMasVendidos[0]?.cantidadVendida || 1;
    return `${(producto.cantidadVendida / maxValue) * 100}%`;
  }

  getProgressPercentage(producto: any): number {
    const maxValue = this.productosMasVendidos[0]?.cantidadVendida || 1;
    return (producto.cantidadVendida / maxValue) * 100;
  }
}