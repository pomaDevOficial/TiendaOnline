import { Component, OnInit } from '@angular/core';
import { Marca } from '../../../interfaces/marca.interface';
import { CommonModule } from '@angular/common';
import { MarcaServicio } from '../../../services/Marca.service';
import {Table, TableModule } from 'primeng/table'
import {ButtonModule } from 'primeng/button'
import { Modal } from 'bootstrap';
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
import { MessageService , ConfirmationService} from 'primeng/api';

@Component({
  selector: 'app-marca',
  imports:[CommonModule , TableModule, ButtonModule, ReactiveFormsModule, FormsModule,ToastModule,ConfirmDialogModule,DialogModule, InputTextModule, TagModule,
    SelectModule, MultiSelectModule, ButtonModule, IconFieldModule, InputIconModule],
  templateUrl: './marca.component.html',
  styleUrls: ['./marca.component.css'],
  providers: [ConfirmationService, MessageService]
})
export class MarcaComponent implements OnInit {

  marcas: Marca[] = [];
  mostrarDialogo: boolean = false;
  marcaModal: any;
  marcaForm!: FormGroup;
  editar: boolean = false;
  marcaSelected!: Marca;
  loading: boolean = true;
  searchValue: string | undefined;
  marcaSeleccionada: Marca | null = null;
  constructor(private marca: MarcaServicio, private fb: FormBuilder, private messageService: MessageService,  private confirmationService: ConfirmationService) { }

  ngOnInit(): void {
    // Cargar datos iniciales (puedes reemplazarlo con tu API)
   this.cargarMarcas();
    this.initForm();
  }
 // Inicializa el FormGroup
  initForm() {
    this.marcaForm = this.fb.group({
       id: [null],
      nombre: ['', Validators.required],
      idestado: [1, Validators.required] // Valor por defecto activo
    });
  }
  cargarMarcas() {
    this.marca.getMarcas().subscribe({
      next: (res:any) => {
         this.loading = false;
        this.marcas = res.data;
      },
      error: (err) => {
        console.error('Error al cargar marcas', err);
      }
    });
  }
 
  abrirRegistro(marca?: Marca) {
    this.editar = !!marca;
      this.mostrarDialogo = true;
    if (marca) {
      this.marcaSelected = marca;
      this.marcaForm.patchValue({
        nombre: marca.nombre
      });
    } else {
      this.marcaForm.reset({ idestado: 1 });
      this.marcaSelected = {} as Marca;
    }

    // Abrir modal usando bootstrap
    const modalEl = document.getElementById('marcaModal');
    if (modalEl) {
      const modal = new (window as any).bootstrap.Modal(modalEl);
      modal.show();
    }
  }
  
  editarMarca(marca: Marca) {
    this.editar = true;
    this.mostrarDialogo = true;
    this.marcaSeleccionada = marca;
    // Llenar el formulario con los datos de la marca
    this.marcaForm.patchValue({
      id: marca.id,
      nombre: marca.nombre,
    });
    const modal = document.getElementById('marcaModal');
    if (modal) {
      const modal1 = new (window as any).bootstrap.Modal(modal);
      modal1.show();
    }
  }
  guardarMarca() {
    if (this.marcaForm.invalid){
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Por favor, complete el nombre de la marca'
      });
      return;
    } 

    const marcaData: Marca = this.marcaForm.value;

    this.marca.createMarca(marcaData).subscribe({
      next: (nuevaMarca: Marca) => {
        this.cargarMarcas();
        this.cerrarDialogo();
      },
      error: (err) => {
        console.error('Error al registrar la marca', err);
      }
    });
  }
  
  guardarEdicion() {
    if (this.marcaForm.invalid) return;

    const marcaData: Marca = this.marcaForm.value;

    this.marca.updateMarca(marcaData.id!, marcaData)
      .subscribe({
        next: (res) => {
            this.cargarMarcas();
          
            this.cerrarDialogo();
            this.editar = false; 
        },
        error: (err) => {
          console.error("Error al actualizar la marca", err);
        }
      });
  }
  actualizarListado(){
      this.cargarMarcas();
  }
  cerrarDialogo(){
      this.mostrarDialogo = false;
  }
  eliminarMarca(marca: Marca) {
    this.confirmationService.confirm({
      message: '¿Seguro que deseas eliminar esta marca?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger p-button-sm', // 🔴 Rojo
      rejectButtonStyleClass: 'p-button-secondary p-button-sm', // ⚪ Gris
      accept: () => {
        this.marca.eliminarMarca(marca.id!, '').subscribe(() => {
          this.cargarMarcas();
          this.messageService.add({
            severity: 'success',
            summary: 'Eliminado',
            detail: 'La marca fue eliminada correctamente'
          });
        });
      }
    });
  }

}
