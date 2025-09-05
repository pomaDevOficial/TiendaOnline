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
import { Persona, Rol, Usuario } from '../../../interfaces/interfaces.interface';
import { UsuarioServicio } from '../../../services/Usuario.service';
import { PersonaServicio } from '../../../services/persona.service';
import { RolServicio } from '../../../services/Rol.service';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-usuario',
  standalone : true,
  templateUrl: './usuario.component.html',
  imports: [
    CommonModule, TableModule, ButtonModule, ReactiveFormsModule, FormsModule,
    ToastModule, ConfirmDialogModule, DialogModule, InputTextModule,
    SelectModule, ButtonModule, IconFieldModule, InputIconModule,DropdownModule, 
    TooltipModule
  ],
  styleUrls: ['./usuario.component.css'],
  providers: [ConfirmationService, MessageService]
})
export class UsuarioComponent implements OnInit {
  personas: Persona[] = [];
  usuarios: Usuario[] = [];
  roles: Rol[] = [];
  personaForm!: FormGroup;
  usuarioForm!: FormGroup;
  mostrarDialogoUsuario: boolean = false;
  mostrarDialogoPersona: boolean = false;
  loading: boolean = true;
  editarUsuario: boolean = false;
  editarPersona: boolean = false;

  constructor(
    private usuarioService: UsuarioServicio,
    private personaService: PersonaServicio,
    private rolesService: RolServicio,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.initForm();
    this.cargarUsuarios();
    this.cargarPersonas();
    this.cargarRoles();
  }

  initForm() {
    this.usuarioForm = this.fb.group({
      id: [null],
      idrol: [null, Validators.required],
      idpersona: [null, Validators.required],
      usuario: ['', Validators.required],
      contrasenia: ['', Validators.required],
    });

    this.personaForm = this.fb.group({
      id: [null],
      nombres: ['', Validators.required],
      idtipopersona: [null, Validators.required],   
      apellidos: ['', Validators.required],
      nroidentidad: ['', Validators.required],
      idtipoidentidad: [null, Validators.required],   
      correo: ['', [Validators.email]],
      telefono: [''],
      idestado: [2, Validators.required]
    });
  }

  cargarPersonas() {
    this.personaService.getPersonasRegistradas().subscribe({
      next: (res: any) => {
        this.personas = res.data;
      },
      error: (err) => {
        console.error('Error al cargar personas', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las personas'
        });
      }
    });
  }

  cargarRoles() {
    this.rolesService.getRolesRegistrados().subscribe({
      next: (res: any) => {
        this.roles = res.data;
      },
      error: (err) => {
        console.error('Error al cargar roles', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los roles'
        });
      }
    });
  }

  cargarUsuarios() {
    this.loading = true;
    this.usuarioService.getUsuarios().subscribe({
      next: (res: any)=> {
        this.loading = false;
        this.usuarios = res.data;
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al cargar usuarios', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los usuarios'
        });
      }
    });
  }

  abrirRegistroPersona() {
    this.editarPersona = false;
    this.mostrarDialogoPersona = true;
    this.personaForm.reset({ 
      idtipopersona: null,
      idtipoidentidad: null,
      idestado: 2
    });
  }

  abrirRegistroUsuario() {
    this.editarUsuario = false;
    this.mostrarDialogoUsuario = true;
    this.usuarioForm.reset({ idestado: 6 });
  }

  editarUsuarioData(usuario: Usuario) {
    this.editarUsuario = true;
    this.mostrarDialogoUsuario = true;
    this.usuarioForm.patchValue(usuario);
  }

  editarPersonaData(persona: Persona) {
    this.editarPersona = true;
    this.mostrarDialogoPersona = true;
    this.personaForm.patchValue(persona);
  }

  cerrarDialogoUsuario() {
    this.mostrarDialogoUsuario = false;
    this.editarUsuario = false;
  }

  cerrarDialogoPersona() {
    this.mostrarDialogoPersona = false;
    this.editarPersona = false;
  }

  guardarUsuario() {
    if (this.usuarioForm.invalid) {
      this.marcarCamposInvalidos(this.usuarioForm);
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Por favor, complete los campos obligatorios'
      });
      return;
    }

    const usuarioData: Usuario = this.usuarioForm.value;
    usuarioData.idestado = 6 ;
    if (this.editarUsuario) {
      this.usuarioService.updateUsuario(usuarioData.id!, usuarioData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Actualización exitosa',
            detail: 'El usuario fue actualizado correctamente'
          });
          this.cargarUsuarios();
          this.cerrarDialogoUsuario();
        },
        error: (err) => {
          console.error('Error al actualizar el usuario', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el usuario'
          });
        }
      });
    } else {
      
      this.usuarioService.createUsuario(usuarioData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Registro exitoso',
            detail: 'El usuario fue registrado correctamente'
          });
          this.cargarUsuarios();
          this.cerrarDialogoUsuario();
        },
        error: (err) => {
          console.error('Error al registrar el usuario', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo registrar el usuario'
          });
        }
      });
    }
  }

  guardarPersona() {
    if (this.personaForm.invalid) {
      this.marcarCamposInvalidos(this.personaForm);
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Por favor, complete los campos obligatorios'
      });
      return;
    }

    const personaData: Persona = this.personaForm.value;
    

    if (this.editarPersona) {
      personaData.idestado = 3;
      this.personaService.updatePersona(personaData.id!, personaData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Actualización exitosa',
            detail: 'La persona fue actualizada correctamente'
          });
          this.cargarPersonas();
          this.cerrarDialogoPersona();
        },
        error: (err) => {
          console.error('Error al actualizar la persona', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar la persona'
          });
        }
      });
    } else {
      personaData.idestado = 2;
      this.personaService.createPersona(personaData).subscribe({
        next: (nuevaPersona) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Registro exitoso',
            detail: 'La persona fue registrada correctamente'
          });
          // ✅ Recargar lista y seleccionar automáticamente
        this.cargarPersonas();
        this.usuarioForm.patchValue({ idpersona: nuevaPersona.id });
       
          this.cerrarDialogoPersona();
        },
        error: (err) => {
          console.error('Error al registrar la persona', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo registrar la persona'
          });
        }
      });
    }
  }

  // Activar usuario usando el método específico del servicio
  activarUsuario(id: number) {
    this.confirmationService.confirm({
      message: '¿Seguro que deseas activar este usuario?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, activar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-success p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-sm',
      accept: () => {
        this.usuarioService.activarUsuario(id).subscribe({
          next: () => {
            this.cargarUsuarios();
            this.messageService.add({
              severity: 'success',
              summary: 'Activado',
              detail: 'El usuario fue activado correctamente'
            });
          },
          error: (err) => {
            console.error('Error al activar usuario', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo activar el usuario'
            });
          }
        });
      }
    });
  }

  // Desactivar usuario usando el método específico del servicio
  desactivarUsuario(id: number) {
    this.confirmationService.confirm({
      message: '¿Seguro que deseas desactivar este usuario?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, desactivar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-sm',
      accept: () => {
        this.usuarioService.desactivarUsuario(id).subscribe({
          next: () => {
            this.cargarUsuarios();
            this.messageService.add({
              severity: 'success',
              summary: 'Desactivado',
              detail: 'El usuario fue desactivado correctamente'
            });
          },
          error: (err) => {
            console.error('Error al desactivar usuario', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo desactivar el usuario'
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
      case 6: return 'bg-success';
      case 7: return 'bg-secondary';
      default: return 'bg-secondary';
    }
  }
}