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
import { MovimientoLote, LoteTalla } from '../../../interfaces/interfaces.interface';
import { MovimientoLoteService } from '../../../services/MovimientoLote.service';
import { LoteTallaServicio } from '../../../services/LoteTalla.service';

@Component({
  selector: 'app-movimiento',
  templateUrl: './movimiento.component.html',
  imports: [  
    CommonModule, TableModule, ButtonModule, ReactiveFormsModule, FormsModule,
    ToastModule, ConfirmDialogModule, DialogModule, InputTextModule,
    SelectModule, ButtonModule, IconFieldModule, InputIconModule,
    TooltipModule, CalendarModule
  ],
  providers: [ConfirmationService, MessageService],
  styleUrls: ['./movimiento.component.css']
})
export class MovimientoComponent implements OnInit {
  movimientos: MovimientoLote[] = [];
  movimientoForm!: FormGroup;
  mostrarDialogoMovimiento: boolean = false;
  loading: boolean = true;
  editarMovimiento: boolean = false;
  mostrarDialogoDetalle: boolean = false;
  movimientoSeleccionado: MovimientoLote | null = null;
  lotesTalla: LoteTalla[] = [];
  tiposMovimiento: any[] = [];
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  idLoteTallaFiltro: number | null = null;

  constructor(
    private movimientoService: MovimientoLoteService,
    private loteTallaService: LoteTallaServicio,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.initForm();
    this.cargarTiposMovimiento();
    this.cargarLotesTalla();
    this.cargarMovimientos();
  }

  initForm() {
    this.movimientoForm = this.fb.group({
      id: [null],
      idlote_talla: [null, Validators.required],
      tipomovimiento: [null, Validators.required],
      cantidad: [0, [Validators.required, Validators.min(1)]],
      fechamovimiento: [new Date().toISOString().slice(0, 16), Validators.required],
      idestado: [1, Validators.required] // por defecto 'registrado'
    });
  }

  cargarTiposMovimiento() {
    this.tiposMovimiento = [
      { label: 'Entrada', value: 'ENTRADA' },
      { label: 'Salida', value: 'SALIDA' },
      { label: 'Ajuste Positivo', value: 'AJUSTE_POSITIVO' },
      { label: 'Ajuste Negativo', value: 'AJUSTE_NEGATIVO' }
    ];
  }

  cargarLotesTalla() {
    this.loteTallaService.getLotesTalla().subscribe({
      next: (response: any) => {
        let lotes: LoteTalla[] = [];
        if (Array.isArray(response)) {
          lotes = response;
        } else if (response && Array.isArray(response.data)) {
          lotes = response.data;
        } else if (response && response.lotesTalla && Array.isArray(response.lotesTalla)) {
          lotes = response.lotesTalla;
        } else {
          console.warn('Unexpected lotes talla response format:', response);
          lotes = [];
        }

        this.lotesTalla = lotes;
      },
      error: (err) => {
        console.error('Error al cargar lotes-talla', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los lotes-talla'
        });
      }
    });
  }

  cargarMovimientos() {
    this.loading = true;
    this.movimientoService.getMovimientos().subscribe({
      next: (response: any) => {
        let movimientos: MovimientoLote[] = [];
        if (Array.isArray(response)) {
          movimientos = response;
        } else if (response && Array.isArray(response.data)) {
          movimientos = response.data;
        } else if (response && response.movimientos && Array.isArray(response.movimientos)) {
          movimientos = response.movimientos;
        } else {
          console.warn('Unexpected movimientos response format:', response);
          movimientos = [];
        }

        this.movimientos = movimientos;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar movimientos', err);
        this.movimientos = [];
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los movimientos'
        });
      }
    });
  }

  cargarMovimientosPorFecha() {
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

    this.movimientoService.getMovimientosByFecha(inicio, fin).subscribe({
      next: (response: any) => {
        let movimientos: MovimientoLote[] = [];
        if (Array.isArray(response)) {
          movimientos = response;
        } else if (response && Array.isArray(response.data)) {
          movimientos = response.data;
        } else if (response && response.movimientos && Array.isArray(response.movimientos)) {
          movimientos = response.movimientos;
        } else {
          console.warn('Unexpected movimientos por fecha response format:', response);
          movimientos = [];
        }

        this.movimientos = movimientos;
        this.loading = false;

        if (movimientos.length === 0) {
          this.messageService.add({
            severity: 'info',
            summary: 'Información',
            detail: 'No se encontraron movimientos en el rango de fechas seleccionado',
            life: 3000
          });
        }
      },
      error: (err) => {
        console.error('Error al cargar movimientos por fecha', err);
        this.movimientos = [];
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los movimientos por fecha'
        });
      }
    });
  }

  cargarMovimientosPorLoteTalla() {
    if (!this.idLoteTallaFiltro) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Seleccione un lote-talla para filtrar'
      });
      return;
    }

    this.loading = true;
    this.movimientoService.getMovimientosByLoteTalla(this.idLoteTallaFiltro).subscribe({
      next: (response: any) => {
        let movimientos: MovimientoLote[] = [];
        if (Array.isArray(response)) {
          movimientos = response;
        } else if (response && Array.isArray(response.data)) {
          movimientos = response.data;
        } else if (response && response.movimientos && Array.isArray(response.movimientos)) {
          movimientos = response.movimientos;
        } else {
          console.warn('Unexpected movimientos por lote-talla response format:', response);
          movimientos = [];
        }

        this.movimientos = movimientos;
        this.loading = false;

        if (movimientos.length === 0) {
          this.messageService.add({
            severity: 'info',
            summary: 'Información',
            detail: 'No se encontraron movimientos para el lote-talla seleccionado',
            life: 3000
          });
        }
      },
      error: (err) => {
        console.error('Error al cargar movimientos por lote-talla', err);
        this.movimientos = [];
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los movimientos por lote-talla'
        });
      }
    });
  }

  verDetalle(movimiento: MovimientoLote) {
    this.movimientoService.getMovimientoById(movimiento.id).subscribe({
      next: (response: any) => {
        let movimientoCompleto: MovimientoLote;
        if (response && typeof response === 'object' && response.id) {
          movimientoCompleto = response;
        } else if (response && response.data && response.data.id) {
          movimientoCompleto = response.data;
        } else if (response && response.movimiento && response.movimiento.id) {
          movimientoCompleto = response.movimiento;
        } else {
          console.warn('Unexpected movimiento detail response format:', response);
          movimientoCompleto = movimiento;
        }

        this.movimientoSeleccionado = movimientoCompleto;
        this.mostrarDialogoDetalle = true;
      },
      error: (err) => {
        console.error('Error al cargar detalle del movimiento', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el detalle del movimiento'
        });
      }
    });
  }

  abrirNuevoMovimiento() {
    this.movimientoForm.reset({
      idestado: 1,
      cantidad: 0,
      fechamovimiento: new Date().toISOString().slice(0, 16)
    });
    this.mostrarDialogoMovimiento = true;
    this.editarMovimiento = false;
  }

  guardarMovimiento() {
    if (this.movimientoForm.invalid) {
      this.marcarCamposInvalidos(this.movimientoForm);
      return;
    }

    const movimientoData = this.movimientoForm.value;

    if (this.editarMovimiento) {
      this.movimientoService.updateMovimiento(movimientoData.id, movimientoData).subscribe({
        next: () => {
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Éxito', 
            detail: 'Movimiento actualizado correctamente' 
          });
          this.cargarMovimientos();
          this.mostrarDialogoMovimiento = false;
        },
        error: (err) => {
          console.error('Error al actualizar movimiento', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el movimiento'
          });
        }
      });
    } else {
      this.movimientoService.createMovimiento(movimientoData).subscribe({
        next: () => {
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Éxito', 
            detail: 'Movimiento creado correctamente' 
          });
          this.cargarMovimientos();
          this.mostrarDialogoMovimiento = false;
        },
        error: (err) => {
          console.error('Error al crear movimiento', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear el movimiento'
          });
        }
      });
    }
  }

  editar(movimiento: MovimientoLote) {
    this.movimientoForm.patchValue({
      ...movimiento,
      fechamovimiento: movimiento.fechamovimiento ? 
        new Date(movimiento.fechamovimiento).toISOString().slice(0, 16) : null
    });
    this.mostrarDialogoMovimiento = true;
    this.editarMovimiento = true;
  }

  eliminarMovimiento(movimiento: MovimientoLote) {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el movimiento #${movimiento.id}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.movimientoService.eliminarMovimiento(movimiento.id).subscribe({
          next: () => {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Éxito', 
              detail: 'Movimiento eliminado correctamente' 
            });
            this.cargarMovimientos();
          },
          error: (err) => {
            console.error('Error al eliminar movimiento', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar el movimiento'
            });
          }
        });
      }
    });
  }

  restaurarMovimiento(movimiento: MovimientoLote) {
    this.confirmationService.confirm({
      message: `¿Está seguro de restaurar el movimiento #${movimiento.id}?`,
      header: 'Confirmar Restauración',
      icon: 'pi pi-refresh',
      accept: () => {
        this.movimientoService.restaurarMovimiento(movimiento.id).subscribe({
          next: () => {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Éxito', 
              detail: 'Movimiento restaurado correctamente' 
            });
            this.cargarMovimientos();
          },
          error: (err) => {
            console.error('Error al restaurar movimiento', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo restaurar el movimiento'
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
      case 2: return 'bg-danger';     // eliminado
      default: return 'bg-secondary';
    }
  }

  getEstadoTexto(idestado: number): string {
    switch (idestado) {
      case 1: return 'Registrado';
      case 2: return 'Eliminado';
      default: return 'Desconocido';
    }
  }

  getTipoMovimientoTexto(tipo: string): string {
    switch (tipo) {
      case 'ENTRADA': return 'Entrada';
      case 'SALIDA': return 'Salida';
      case 'AJUSTE_POSITIVO': return 'Ajuste (+)';
      case 'AJUSTE_NEGATIVO': return 'Ajuste (-)';
      default: return tipo;
    }
  }

  getTipoMovimientoBadgeClass(tipo: string): string {
    switch (tipo) {
      case 'ENTRADA': return 'bg-success';
      case 'SALIDA': return 'bg-danger';
      case 'AJUSTE_POSITIVO': return 'bg-info';
      case 'AJUSTE_NEGATIVO': return 'bg-warning';
      default: return 'bg-secondary';
    }
  }

  limpiarFiltros() {
    this.fechaInicio = null;
    this.fechaFin = null;
    this.idLoteTallaFiltro = null;
    this.cargarMovimientos();
    
    this.messageService.add({
      severity: 'info',
      summary: 'Filtros limpiados',
      detail: 'Mostrando todos los movimientos',
      life: 3000
    });
  }
}