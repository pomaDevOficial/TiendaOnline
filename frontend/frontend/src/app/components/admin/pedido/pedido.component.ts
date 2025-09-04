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
import { Pedido, Persona, MetodoPago } from '../../../interfaces/interfaces.interface';
import { PersonaServicio } from '../../../services/persona.service';
import { MetodoPagoServicio } from '../../../services/MetodoPago.service';
import { TooltipModule } from 'primeng/tooltip';
import { PedidoServicio } from '../../../services/Pedido.service';

@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.component.html',
  imports: [  
    CommonModule, TableModule, ButtonModule, ReactiveFormsModule, FormsModule,
    ToastModule, ConfirmDialogModule, DialogModule, InputTextModule,
    SelectModule, ButtonModule, IconFieldModule, InputIconModule,
    TooltipModule
  ],
  providers: [ConfirmationService, MessageService],
  styleUrls: ['./pedido.component.css']
})
export class PedidoComponent implements OnInit {
  pedidos: Pedido[] = [];
  pedidoForm!: FormGroup;
  mostrarDialogoPedido: boolean = false;
  loading: boolean = true;
  editarPedido: boolean = false;
  mostrarDialogoDetalle: boolean = false;
  pedidoSeleccionado: Pedido | null = null;
  clientes: Persona[] = [];
  metodoPagoOptions: { label: string, value: number }[] = [];

  constructor(
    private pedidoService: PedidoServicio,
    private personaService: PersonaServicio,
    private metodoPagoService: MetodoPagoServicio,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.initForm();
    this.cargarMetodosPago();
    this.cargarClientes();
    this.cargarPedidos();
  }

  initForm() {
    this.pedidoForm = this.fb.group({
      id: [null],
      idpersona: [null, Validators.required],
      idmetodopago: [null, Validators.required],
      fechaoperacion: [null, Validators.required],
      totalimporte: [0, [Validators.required, Validators.min(0)]],
      adjunto: [''],
      idestado: [2, Validators.required] // por defecto 'pendiente'
    });
  }

  cargarMetodosPago() {
    this.metodoPagoService.getMetodosPagoRegistrados().subscribe({
      next: (response: any) => {
        console.log('Response from metodos pago service:', response);
        
        // Handle different response formats
        let metodosPago: MetodoPago[] = [];
        if (Array.isArray(response)) {
          metodosPago = response;
        } else if (response && Array.isArray(response.data)) {
          metodosPago = response.data;
        } else if (response && response.metodosPago && Array.isArray(response.metodosPago)) {
          metodosPago = response.metodosPago;
        } else {
          console.warn('Unexpected metodos pago response format:', response);
          metodosPago = [];
        }

        // Transform to option format
        this.metodoPagoOptions = metodosPago.map(metodo => ({
          label: metodo.nombre || 'Sin nombre',
          value: metodo.id || 0
        }));

        // Add fallback options if service fails or returns empty
        if (this.metodoPagoOptions.length === 0) {
          this.metodoPagoOptions = [
            { label: 'Efectivo', value: 1 },
            { label: 'Tarjeta', value: 2 },
            { label: 'Transferencia', value: 3 },
            { label: 'Yape/Plin', value: 4 }
          ];
        }
      },
      error: (err) => {
        console.error('Error al cargar métodos de pago', err);
        // Use fallback options on error
        this.metodoPagoOptions = [
          { label: 'Efectivo', value: 1 },
          { label: 'Tarjeta', value: 2 },
          { label: 'Transferencia', value: 3 },
          { label: 'Yape/Plin', value: 4 }
        ];
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'No se pudieron cargar los métodos de pago desde el servidor, usando valores por defecto'
        });
      }
    });
  }

  cargarClientes() {
    this.personaService.getPersonasRegistradas().subscribe({
      next: (response: any) => {
        console.log('Response from personas service:', response);
        
        // Handle different response formats
        let personas: Persona[] = [];
        if (Array.isArray(response)) {
          personas = response;
        } else if (response && Array.isArray(response.data)) {
          personas = response.data;
        } else if (response && response.personas && Array.isArray(response.personas)) {
          personas = response.personas;
        } else {
          console.warn('Unexpected personas response format:', response);
          personas = [];
        }

        // Filtrar solo clientes (idtipopersona = 1) y agregar propiedad nombresCompletos
        this.clientes = personas
          .filter(p => p?.idtipopersona === 1)
          .map(p => ({
            ...p,
            nombresCompletos: `${p.nombres || ''} ${p.apellidos || ''} - ${p.nroidentidad || ''}`.trim()
          }));
      },
      error: (err) => {
        console.error('Error al cargar clientes', err);
        this.clientes = []; // Ensure it's always an array
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los clientes'
        });
      }
    });
  }

  cargarPedidos() {
    this.loading = true;
    this.pedidoService.getPedidos().subscribe({
      next: (response: any) => {
        console.log('Response from pedidos service:', response);
        
        // Handle different response formats
        let pedidos: Pedido[] = [];
        if (Array.isArray(response)) {
          pedidos = response;
        } else if (response && Array.isArray(response.data)) {
          pedidos = response.data;
        } else if (response && response.pedidos && Array.isArray(response.pedidos)) {
          pedidos = response.pedidos;
        } else {
          console.warn('Unexpected pedidos response format:', response);
          pedidos = [];
        }

        this.pedidos = pedidos;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar pedidos', err);
        this.pedidos = []; // Ensure it's always an array
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los pedidos'
        });
      }
    });
  }

  verDetalle(pedido: Pedido) {
    this.pedidoService.getPedidoById(pedido.id).subscribe({
      next: (response: any) => {
        console.log('Response from pedido detail service:', response);
        
        // Handle different response formats
        let pedidoCompleto: Pedido;
        if (response && typeof response === 'object' && response.id) {
          pedidoCompleto = response;
        } else if (response && response.data && response.data.id) {
          pedidoCompleto = response.data;
        } else if (response && response.pedido && response.pedido.id) {
          pedidoCompleto = response.pedido;
        } else {
          console.warn('Unexpected pedido detail response format:', response);
          pedidoCompleto = pedido; // Fallback to original pedido
        }

        // Ensure Detalles is always an array
        if (!pedidoCompleto.Detalles || !Array.isArray(pedidoCompleto.Detalles)) {
          pedidoCompleto.Detalles = [];
        }

        this.pedidoSeleccionado = pedidoCompleto;
        this.mostrarDialogoDetalle = true;
      },
      error: (err) => {
        console.error('Error al cargar detalle del pedido', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el detalle del pedido'
        });
      }
    });
  }

  abrirNuevoPedido() {
    this.pedidoForm.reset({
      idestado: 2,
      totalimporte: 0,
      fechaoperacion: new Date().toISOString().slice(0, 16)
    });
    this.mostrarDialogoPedido = true;
    this.editarPedido = false;
  }

  guardarPedido() {
    if (this.pedidoForm.invalid) {
      this.marcarCamposInvalidos(this.pedidoForm);
      return;
    }

    const pedidoData = this.pedidoForm.value;

    if (this.editarPedido) {
      this.pedidoService.updatePedido(pedidoData.id, pedidoData).subscribe({
        next: () => {
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Éxito', 
            detail: 'Pedido actualizado correctamente' 
          });
          this.cargarPedidos();
          this.mostrarDialogoPedido = false;
        },
        error: (err) => {
          console.error('Error al actualizar pedido', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el pedido'
          });
        }
      });
    } else {
      this.pedidoService.createPedido(pedidoData).subscribe({
        next: () => {
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Éxito', 
            detail: 'Pedido creado correctamente' 
          });
          this.cargarPedidos();
          this.mostrarDialogoPedido = false;
        },
        error: (err) => {
          console.error('Error al crear pedido', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear el pedido'
          });
        }
      });
    }
  }

  editar(pedido: Pedido) {
    this.pedidoForm.patchValue({
      ...pedido,
      fechaoperacion: pedido.fechaoperacion ? 
        new Date(pedido.fechaoperacion).toISOString().slice(0, 16) : null
    });
    this.mostrarDialogoPedido = true;
    this.editarPedido = true;
  }

  aprobarPedido(pedido: Pedido) {
    this.confirmationService.confirm({
      message: `¿Está seguro de aprobar el pedido #${pedido.id}?`,
      header: 'Confirmar Aprobación',
      icon: 'pi pi-check-circle',
      accept: () => {
        this.pedidoService.aprobarPedido(pedido.id).subscribe({
          next: () => {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Éxito', 
              detail: 'Pedido aprobado correctamente' 
            });
            this.cargarPedidos();
          },
          error: (err) => {
            console.error('Error al aprobar pedido', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo aprobar el pedido'
            });
          }
        });
      }
    });
  }

  eliminar(pedido: Pedido) {
    this.confirmationService.confirm({
      message: `¿Está seguro de cancelar el pedido #${pedido.id}?`,
      header: 'Confirmar Cancelación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.pedidoService.cancelarPedido(pedido.id).subscribe({
          next: () => {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Éxito', 
              detail: 'Pedido cancelado correctamente' 
            });
            this.cargarPedidos();
          },
          error: (err) => {
            console.error('Error al cancelar pedido', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo cancelar el pedido'
            });
          }
        });
      }
    });
  }

  restaurarPedido(pedido: Pedido) {
    this.confirmationService.confirm({
      message: `¿Está seguro de restaurar el pedido #${pedido.id}?`,
      header: 'Confirmar Restauración',
      icon: 'pi pi-refresh',
      accept: () => {
        this.pedidoService.restaurarPedido(pedido.id).subscribe({
          next: () => {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Éxito', 
              detail: 'Pedido restaurado correctamente' 
            });
            this.cargarPedidos();
          },
          error: (err) => {
            console.error('Error al restaurar pedido', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo restaurar el pedido'
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
      case 6: return 'bg-success';    // aprobado
      case 7: return 'bg-danger';     // cancelado
      case 2: return 'bg-warning';    // pendiente
      default: return 'bg-secondary';
    }
  }

  getEstadoTexto(idestado: number): string {
    switch (idestado) {
      case 6: return 'Aprobado';
      case 7: return 'Cancelado';
      case 2: return 'Pendiente';
      default: return 'Desconocido';
    }
  }

  calcularSubtotal(detalle: any): number {
    return (detalle?.cantidad || 0) * (detalle?.precio || 0);
  }

  getMetodoPagoTexto(id: number): string {
    const metodo = this.metodoPagoOptions.find(m => m.value === id);
    return metodo ? metodo.label : 'Desconocido';
  }
}