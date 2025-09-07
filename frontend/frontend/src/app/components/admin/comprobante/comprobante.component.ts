import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { CalendarModule } from 'primeng/calendar';
import { Comprobante, Venta, TipoComprobante, PedidoDetalle } from '../../../interfaces/interfaces.interface';
import { ComprobanteServicio } from '../../../services/Comprobante.service';
import { VentaServicio } from '../../../services/Venta.service';
import { TipoComprobanteServicio } from '../../../services/TipoComprobante.service';
import { WspServicio } from '../../../services/Wsp.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PedidoServicio } from '../../../services/Pedido.service';

@Component({
  selector: 'app-comprobante',
  templateUrl: './comprobante.component.html',
  imports: [  
    CommonModule, TableModule, ButtonModule, ReactiveFormsModule, FormsModule,
    ToastModule, ConfirmDialogModule, DialogModule, InputTextModule,
    SelectModule, ButtonModule, IconFieldModule, InputIconModule,
    TooltipModule, CalendarModule,ProgressSpinnerModule
  ],
  providers: [ConfirmationService, MessageService],
  styleUrls: ['./comprobante.component.css']
})
export class ComprobanteComponent implements OnInit {
  comprobantes: Comprobante[] = [];
  comprobanteForm!: FormGroup;
  mostrarDialogoComprobante: boolean = false;
  loading: boolean = true;
  editarComprobante: boolean = false;
  mostrarDialogoDetalle: boolean = false;
  comprobanteSeleccionado: Comprobante | null = null;
  ventas: Venta[] = [];
  tiposComprobante: TipoComprobante[] = [];
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  pedidoDetalles: PedidoDetalle[] = [];

  constructor(
    private comprobanteService: ComprobanteServicio,
    private ventaService: VentaServicio,
    private tipoComprobanteService: TipoComprobanteServicio,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private wspService: WspServicio, // Inyectar el servicio de WhatsApp
    private pedidoService: PedidoServicio   // 

  ) {}

  ngOnInit() {
    this.initForm();
    this.cargarTiposComprobante();
    this.cargarVentas();
    this.cargarComprobantes();
  }

  initForm() {
    this.comprobanteForm = this.fb.group({
      id: [null],
      idventa: [null, Validators.required],
      igv: [0, [Validators.required, Validators.min(0)]],
      descuento: [0, [Validators.required, Validators.min(0)]],
      total: [0, [Validators.required, Validators.min(0)]],
      idtipocomprobante: [null, Validators.required],
      numserie: ['', Validators.required],
      idestado: [1, Validators.required] // por defecto 'registrado'
    });
  }

  cargarTiposComprobante() {
    this.tipoComprobanteService.getTiposComprobante().subscribe({
      next: (response: any) => {
        let tipos: TipoComprobante[] = [];
        if (Array.isArray(response)) {
          tipos = response;
        } else if (response && Array.isArray(response.data)) {
          tipos = response.data;
        } else if (response && response.tiposComprobante && Array.isArray(response.tiposComprobante)) {
          tipos = response.tiposComprobante;
        } else {
          console.warn('Unexpected tipos comprobante response format:', response);
          tipos = [];
        }

        this.tiposComprobante = tipos;
      },
      error: (err) => {
        console.error('Error al cargar tipos de comprobante', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los tipos de comprobante'
        });
      }
    });
  }

  cargarVentas() {
    this.ventaService.getVentas().subscribe({
      next: (response: any) => {
        let ventas: Venta[] = [];
        if (Array.isArray(response)) {
          ventas = response;
        } else if (response && Array.isArray(response.data)) {
          ventas = response.data;
        } else if (response && response.ventas && Array.isArray(response.ventas)) {
          ventas = response.ventas;
        } else {
          console.warn('Unexpected ventas response format:', response);
          ventas = [];
        }

        this.ventas = ventas;
      },
      error: (err) => {
        console.error('Error al cargar ventas', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las ventas'
        });
      }
    });
  }

  cargarComprobantes() {
    this.loading = true;
    this.comprobanteService.getComprobantes().subscribe({
      next: (response: any) => {
        let comprobantes: Comprobante[] = [];
        if (Array.isArray(response)) {
          comprobantes = response;
        } else if (response && Array.isArray(response.data)) {
          comprobantes = response.data;
        } else if (response && response.comprobantes && Array.isArray(response.comprobantes)) {
          comprobantes = response.comprobantes;
        } else {
          console.warn('Unexpected comprobantes response format:', response);
          comprobantes = [];
        }

        this.comprobantes = comprobantes;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar comprobantes', err);
        this.comprobantes = [];
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los comprobantes'
        });
      }
    });
  }

cargarComprobantesPorFecha() {
  if (!this.fechaInicio || !this.fechaFin) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'Seleccione ambas fechas para filtrar'
    });
    return;
  }

  this.loading = true;
  const inicio = this.fechaInicio.toISOString().split('T')[0];
  const fin = this.fechaFin.toISOString().split('T')[0];

  this.comprobanteService.getComprobantesByFecha(inicio, fin).subscribe({
    next: (response: any) => {
      let comprobantes: Comprobante[] = [];
      if (Array.isArray(response)) {
        comprobantes = response;
      } else if (response && Array.isArray(response.data)) {
        comprobantes = response.data;
      } else if (response && response.comprobantes && Array.isArray(response.comprobantes)) {
        comprobantes = response.comprobantes;
      } else {
        console.warn('Unexpected comprobantes por fecha response format:', response);
        comprobantes = [];
      }

      this.comprobantes = comprobantes;
      this.loading = false;

      // Mostrar mensaje si no hay comprobantes en las fechas seleccionadas
      if (comprobantes.length === 0) {
        this.messageService.add({
          severity: 'info',
          summary: 'Información',
          detail: 'No se encontraron comprobantes en el rango de fechas seleccionado',
          life: 3000 // El mensaje se autoelimina después de 3 segundos
        });
      } else {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Se encontraron ${comprobantes.length} comprobante(s) en el rango de fechas`,
          life: 3000
        });
      }
    },
    error: (err) => {
      console.error('Error al cargar comprobantes por fecha', err);
      this.comprobantes = [];
      this.loading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los comprobantes por fecha'
      });
    }
  });
}

  verDetalle(comprobante: Comprobante) {
  this.comprobanteService.getComprobanteById(comprobante.id).subscribe({
    next: (response: any) => {
      let comprobanteCompleto: Comprobante;
      if (response && typeof response === 'object' && response.id) {
        comprobanteCompleto = response;
      } else if (response && response.data && response.data.id) {
        comprobanteCompleto = response.data;
      } else if (response && response.comprobante && response.comprobante.id) {
        comprobanteCompleto = response.comprobante;
      } else {
        console.warn('Unexpected comprobante detail response format:', response);
        comprobanteCompleto = comprobante;
      }

      this.comprobanteSeleccionado = comprobanteCompleto;
      this.mostrarDialogoDetalle = true;

      // 👇 cargar detalles del pedido
      const idpedido = comprobanteCompleto?.Venta?.Pedido?.id;
      if (idpedido) {
        this.pedidoService.getDetallesByPedido(idpedido).subscribe({
          next: (resp:any) => {
            this.pedidoDetalles = resp.data || [];
            console.log(resp);
          },
          error: (err) => {
            console.error('Error al cargar detalles del pedido', err);
            this.pedidoDetalles = [];
          }
        });
      } else {
        this.pedidoDetalles = [];
      }
    },
    error: (err) => {
      console.error('Error al cargar detalle del comprobante', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar el detalle del comprobante'
      });
    }
  });
}


  abrirNuevoComprobante() {
    this.comprobanteForm.reset({
      idestado: 1,
      igv: 0,
      descuento: 0,
      total: 0
    });
    this.mostrarDialogoComprobante = true;
    this.editarComprobante = false;
  }

  guardarComprobante() {
    if (this.comprobanteForm.invalid) {
      this.marcarCamposInvalidos(this.comprobanteForm);
      return;
    }

    const comprobanteData = this.comprobanteForm.value;

    if (this.editarComprobante) {
      this.comprobanteService.updateComprobante(comprobanteData.id, comprobanteData).subscribe({
        next: () => {
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Éxito', 
            detail: 'Comprobante actualizado correctamente' 
          });
          this.cargarComprobantes();
          this.mostrarDialogoComprobante = false;
        },
        error: (err) => {
          console.error('Error al actualizar comprobante', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el comprobante'
          });
        }
      });
    } else {
      this.comprobanteService.createComprobante(comprobanteData).subscribe({
        next: () => {
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Éxito', 
            detail: 'Comprobante creado correctamente' 
          });
          this.cargarComprobantes();
          this.mostrarDialogoComprobante = false;
        },
        error: (err) => {
          console.error('Error al crear comprobante', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear el comprobante'
          });
        }
      });
    }
  }

  editar(comprobante: Comprobante) {
    this.comprobanteForm.patchValue(comprobante);
    this.mostrarDialogoComprobante = true;
    this.editarComprobante = true;
  }

  anularComprobante(comprobante: Comprobante) {
    this.confirmationService.confirm({
      message: `¿Está seguro de anular el comprobante ${comprobante.numserie}?`,
      header: 'Confirmar Anulación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.comprobanteService.anularComprobante(comprobante.id).subscribe({
          next: () => {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Éxito', 
              detail: 'Comprobante anulado correctamente' 
            });
            this.cargarComprobantes();
          },
          error: (err) => {
            console.error('Error al anular comprobante', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo anular el comprobante'
            });
          }
        });
      }
    });
  }

  restaurarComprobante(comprobante: Comprobante) {
    this.confirmationService.confirm({
      message: `¿Está seguro de restaurar el comprobante ${comprobante.numserie}?`,
      header: 'Confirmar Restauración',
      icon: 'pi pi-refresh',
      accept: () => {
        this.comprobanteService.restaurarComprobante(comprobante.id).subscribe({
          next: () => {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Éxito', 
              detail: 'Comprobante restaurado correctamente' 
            });
            this.cargarComprobantes();
          },
          error: (err) => {
            console.error('Error al restaurar comprobante', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo restaurar el comprobante'
            });
          }
        });
      }
    });
  }

  eliminarComprobante(comprobante: Comprobante) {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar permanentemente el comprobante ${comprobante.numserie}? Esta acción no se puede deshacer.`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.comprobanteService.deleteComprobante(comprobante.id).subscribe({
          next: () => {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Éxito', 
              detail: 'Comprobante eliminado correctamente' 
            });
            this.cargarComprobantes();
          },
          error: (err) => {
            console.error('Error al eliminar comprobante', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar el comprobante'
            });
          }
        });
      }
    });
  }

  reenviarComprobante(comprobante: Comprobante) {
  this.confirmationService.confirm({
    message: `¿Está seguro de reenviar el comprobante ${comprobante.numserie} por WhatsApp?`,
    header: 'Confirmar Reenvío',
    icon: 'pi pi-whatsapp',
    accept: () => {
      this.loading = true;
      this.wspService.reenviarComprobante(comprobante.id).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: response.message || 'Comprobante reenviado correctamente por WhatsApp'
            });
          } else {
            this.messageService.add({
              severity: 'warn',
              summary: 'Advertencia',
              detail: response.error || 'No se pudo reenviar el comprobante'
            });
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('Error al reenviar comprobante por WhatsApp', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al conectar con el servicio de WhatsApp'
          });
        }
      });
    }
  });
}


  private marcarCamposInvalidos(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control?.invalid) {
        control.markAsTouched();
      }
    });
  }

  getEstadoBadgeClass(idestado: number): string {
    switch (idestado) {
      case 1: return 'bg-success';    // registrado
      case 2: return 'bg-danger';     // anulado
      default: return 'bg-secondary';
    }
  }

  getEstadoTexto(idestado: number): string {
    switch (idestado) {
      case 1: return 'Registrado';
      case 2: return 'Anulado';
      default: return 'Desconocido';
    }
  }

  limpiarFiltros() {
    this.fechaInicio = null;
    this.fechaFin = null;
    this.cargarComprobantes();
  }
}