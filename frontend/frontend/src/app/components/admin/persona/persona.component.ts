import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { MultiSelectModule } from 'primeng/multiselect';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { Persona } from '../../../interfaces/interfaces.interface';
import { PersonaServicio } from '../../../services/persona.service';

@Component({
  selector: 'app-persona',
  templateUrl: './persona.component.html',
  imports: [
    CommonModule, TableModule, ButtonModule, ReactiveFormsModule, FormsModule,
    ToastModule, ConfirmDialogModule, DialogModule, InputTextModule, TagModule,
    SelectModule, MultiSelectModule, ButtonModule, IconFieldModule, InputIconModule
  ],
  styleUrls: ['./persona.component.css'],
  providers: [ConfirmationService, MessageService]
})
export class PersonaComponent implements OnInit {

  personas: Persona[] = [];
  personaForm!: FormGroup;
  mostrarDialogo: boolean = false;
  loading: boolean = true;
  editar: boolean = false;

  constructor(
    private personaService: PersonaServicio,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    this.initForm();
    this.cargarPersonas();
  }

  initForm() {
    this.personaForm = this.fb.group({
      id: [null],
      nombres: ['', Validators.required],
      idtipopersona: [null, Validators.required],   
      apellidos: ['', Validators.required],
      nroidentidad: ['', Validators.required],
    idtipoidentidad: [null, Validators.required],   
      correo: ['', [Validators.email]],
      telefono: [''],
    });
  }

  cargarPersonas() {
    this.personaService.getPersonasRegistradas().subscribe({
      next: (res: any) => {
        this.loading = false;
        this.personas = res.data;
      },
      error: (err) => {
        console.error('Error al cargar personas', err);
      }
    });
  }

  abrirRegistro() {
    this.editar = false;
    this.mostrarDialogo = true;
    this.personaForm.reset({ idestado: 1 });
  }

  editarPersona(persona: Persona) {
    this.editar = true;
    this.mostrarDialogo = true;
    this.personaForm.patchValue(persona);
  }

  cerrarDialogo() {
    this.mostrarDialogo = false;
  }

  actualizarListado() {
    this.cargarPersonas();
  }

  guardarPersona() {
    if (this.personaForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Por favor, complete los campos obligatorios'
      });
      return;
    }

    const personaData: Persona = this.personaForm.value;
    personaData.idestado = 2;

    this.personaService.createPersona(personaData).subscribe({
      next: (nuevaPersona: Persona) => {
        this.cargarPersonas();
        this.cerrarDialogo();
      },
      error: (err) => {
        console.error('Error al registrar la persona', err);
      }
    });
  }

  guardarEdicion() {
    if (this.personaForm.invalid) return;

    const personaData: Persona = this.personaForm.value;
    personaData.idestado = 3;
    this.personaService.updatePersona(personaData.id!, personaData)
      .subscribe({
        next: (res) => {
         this.messageService.add({
          severity: 'success',
          summary: 'Actualización exitosa',
          detail: 'Los datos se actualizaron correctamente'
        });
          this.cargarPersonas();
          this.cerrarDialogo();
          this.editar = false;
        },
        error: (err) => {
          console.error("Error al actualizar la persona", err);
        }
      });
  }

  eliminarPersona(persona: Persona) {
    this.confirmationService.confirm({
      message: '¿Seguro que deseas eliminar esta persona?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-sm',
      accept: () => {
        this.personaService.eliminarPersona(persona.id!).subscribe(() => {
          this.cargarPersonas();
          this.messageService.add({
            severity: 'success',
            summary: 'Eliminado',
            detail: 'La persona fue eliminada correctamente'
          });
        });
      }
    });
  }
}
