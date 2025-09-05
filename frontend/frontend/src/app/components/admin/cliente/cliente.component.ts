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
import { Persona } from '../../../interfaces/interfaces.interface';
import { PersonaServicio } from '../../../services/persona.service';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  imports: [  
    CommonModule, TableModule, ButtonModule, ReactiveFormsModule, FormsModule,
    ToastModule, ConfirmDialogModule, DialogModule, InputTextModule,
    SelectModule, ButtonModule, IconFieldModule, InputIconModule,
    TooltipModule
  ],
  providers: [ConfirmationService, MessageService],
  styleUrls: ['./cliente.component.css']
})
export class ClienteComponent implements OnInit {
  clientes: Persona[] = [];
  clienteForm!: FormGroup;
  mostrarDialogoCliente: boolean = false;
  loading: boolean = true;
  editarCliente: boolean = false;
  clienteSeleccionado: Persona | null = null;

  // Opciones para selects
  tipoIdentidadOptions = [
    { label: 'DNI', value: 1 },
    { label: 'RUC', value: 2 }
  ];

  constructor(
    private personaService: PersonaServicio,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.initForm();
    this.cargarClientes();
  }

  initForm() {
    this.clienteForm = this.fb.group({
      id: [null],
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      idtipoidentidad: [1, Validators.required], // DNI por defecto
      nroidentidad: ['', [Validators.required, Validators.pattern('^[0-9]{8,11}$')]],
      correo: ['', [Validators.email]],
      telefono: ['', [Validators.pattern('^[0-9]{9,15}$')]],
      direccion: ['']
    });
  }

  cargarClientes() {
    this.loading = true;
    this.personaService.getClientes().subscribe({
      next: (response: any) => {
        let clientes: Persona[] = [];
        if (Array.isArray(response)) {
          clientes = response;
        } else if (response && Array.isArray(response.data)) {
          clientes = response.data;
        } else if (response && response.clientes && Array.isArray(response.clientes)) {
          clientes = response.clientes;
        } else {
          console.warn('Unexpected clientes response format:', response);
          clientes = [];
        }

        this.clientes = clientes;
        this.loading = false;

        if (clientes.length === 0) {
          this.messageService.add({
            severity: 'info',
            summary: 'Sin clientes',
            detail: 'No hay clientes registrados en el sistema',
            life: 3000
          });
        }
      },
      error: (err) => {
        console.error('Error al cargar clientes', err);
        this.clientes = [];
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los clientes'
        });
      }
    });
  }

  verDetalle(cliente: Persona) {
    this.clienteSeleccionado = cliente;
  }

  abrirNuevoCliente() {
    this.clienteForm.reset({
      idtipoidentidad: 1, // DNI por defecto
      idtipopersona: 1    // Siempre será cliente
    });
    this.mostrarDialogoCliente = true;
    this.editarCliente = false;
  }

  guardarCliente() {
    if (this.clienteForm.invalid) {
      this.marcarCamposInvalidos(this.clienteForm);
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Por favor, complete los campos obligatorios correctamente'
      });
      return;
    }

    const clienteData = {
      ...this.clienteForm.value,
      idtipopersona: 1, // Siempre cliente
      idestado: 2       // REGISTRADO (estado 2)
    };

    // Verificar DNI/RUC único antes de guardar
    this.personaService.verificarDni(clienteData.nroidentidad).subscribe({
      next: (response: any) => {
        if (response.existe) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Documento existente',
            detail: 'El número de documento ya está registrado en el sistema'
          });
          return;
        }

        this.personaService.createPersona(clienteData).subscribe({
          next: () => {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Éxito', 
              detail: 'Cliente creado correctamente' 
            });
            this.cargarClientes();
            this.mostrarDialogoCliente = false;
          },
          error: (err) => {
            console.error('Error al crear cliente', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo crear el cliente'
            });
          }
        });
      },
      error: (err) => {
        console.error('Error al verificar documento', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo verificar el documento'
        });
      }
    });
  }

  editar(cliente: Persona) {
    this.clienteForm.patchValue(cliente);
    this.mostrarDialogoCliente = true;
    this.editarCliente = true;
  }

  guardarEdicion() {
    if (this.clienteForm.invalid) {
      this.marcarCamposInvalidos(this.clienteForm);
      return;
    }

    const clienteData = {
      ...this.clienteForm.value,
      idtipopersona: 1,
      idestado: 3 // ACTUALIZADO (estado 3)
    };

    this.personaService.updatePersona(clienteData.id, clienteData).subscribe({
      next: () => {
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Éxito', 
          detail: 'Cliente actualizado correctamente' 
        });
        this.cargarClientes();
        this.mostrarDialogoCliente = false;
      },
      error: (err) => {
        console.error('Error al actualizar cliente', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar el cliente'
        });
      }
    });
  }

  eliminarCliente(cliente: Persona) {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar al cliente ${cliente.nombres} ${cliente.apellidos}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.personaService.eliminarPersona(cliente.id!).subscribe({
          next: () => {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Éxito', 
              detail: 'Cliente eliminado correctamente' 
            });
            this.cargarClientes();
          },
          error: (err) => {
            console.error('Error al eliminar cliente', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar el cliente'
            });
          }
        });
      }
    });
  }

  restaurarCliente(cliente: Persona) {
    this.confirmationService.confirm({
      message: `¿Está seguro de restaurar al cliente ${cliente.nombres} ${cliente.apellidos}?`,
      header: 'Confirmar Restauración',
      icon: 'pi pi-refresh',
      accept: () => {
        this.personaService.restaurarPersona(cliente.id!).subscribe({
          next: () => {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Éxito', 
              detail: 'Cliente restaurado correctamente' 
            });
            this.cargarClientes();
          },
          error: (err) => {
            console.error('Error al restaurar cliente', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo restaurar el cliente'
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

  getTipoIdentidadTexto(id: number): string {
    return id === 1 ? 'DNI' : 'RUC';
  }

  getEstadoBadgeClass(idestado: number): string {
    switch (idestado) {
      case 2: return 'bg-success';    // REGISTRADO
      case 3: return 'bg-info';       // ACTUALIZADO
      case 4: return 'bg-danger';     // ELIMINADO
      default: return 'bg-secondary';
    }
  }


  // Método para verificar si un cliente está eliminado
  isClienteEliminado(cliente: Persona): boolean {
    return cliente.idestado === 4;
  }

  // Método para verificar si un cliente está activo (no eliminado)
  isClienteActivo(cliente: Persona): boolean {
    return cliente.idestado === 2 || cliente.idestado === 3;
  }
}