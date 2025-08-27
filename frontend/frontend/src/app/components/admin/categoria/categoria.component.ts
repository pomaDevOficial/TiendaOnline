import { Component, OnInit } from '@angular/core';
import { CategoriaServicio } from '../../../services/Categoria.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Categoria, Talla } from '../../../interfaces/interfaces.interface';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-categoria',
  imports:[CommonModule , TableModule, ButtonModule, ReactiveFormsModule, FormsModule,ToastModule,ConfirmDialogModule,DialogModule, InputTextModule, TagModule,
    SelectModule, MultiSelectModule, ButtonModule, IconFieldModule, InputIconModule],
  templateUrl: './categoria.component.html',
  styleUrls: ['./categoria.component.css'],
  providers: [ConfirmationService, MessageService]
})
export class CategoriaComponent implements OnInit {

  categorias: Categoria[] = [];
  categoriaForm!: FormGroup;
    mostrarDialogo: boolean = false;
  loading: boolean = true;
  editar: boolean = false;
  constructor(private categoria: CategoriaServicio, private fb: FormBuilder, private messageService: MessageService,  private confirmationService: ConfirmationService) { }


  ngOnInit() {
    this.initForm();
    this.cargarCategoria();
  }
  initForm() {
    this.categoriaForm = this.fb.group({
       id: [null],
      nombre: ['', Validators.required],
      idestado: [1, Validators.required] // Valor por defecto activo
    });
  }
  cargarCategoria() {
    this.categoria.getCategorias().subscribe({
      next: (res:any) => {
         this.loading = false;
        this.categorias = res.data;
      },
      error: (err) => {
        console.error('Error al cargar tallas', err);
      }
    });
  }

  abrirRegistro() {
    this.editar = false;
    this.mostrarDialogo = true;
    this.categoriaForm.reset({ idestado: 1 });
  }
  editarCategoria(talla: Talla) {
      this.editar = true;
      this.mostrarDialogo = true;
      this.categoriaForm.patchValue({
        id: talla.id,
        nombre: talla.nombre,
      });
      
    }
  cerrarDialogo(){
      this.mostrarDialogo = false;
  }

  actualizarListado(){
      this.cargarCategoria();
  }

  guardarCategoria() {
    if (this.categoriaForm.invalid){
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Por favor, complete el nombre de la Talla'
      });
      return;
    } 

    const categoriaData: Categoria = this.categoriaForm.value;

    this.categoria.createCategoria(categoriaData).subscribe({
      next: (nuevaMarca: Talla) => {
        this.cargarCategoria();
        this.cerrarDialogo();
      },
      error: (err) => {
        console.error('Error al registrar la talla', err);
      }
    });
  }
  
  guardarEdicion() {
    if (this.categoriaForm.invalid) return;

    const marcaData: Categoria = this.categoriaForm.value;

    this.categoria.updateCategoria(marcaData.id!, marcaData)
      .subscribe({
        next: (res) => {
            this.cargarCategoria();
          
            this.cerrarDialogo();
            this.editar = false; 
        },
        error: (err) => {
          console.error("Error al actualizar la talla", err);
        }
      });
  }

  eliminarCategoria(categoria: Categoria) {
      this.confirmationService.confirm({
        message: '¿Seguro que deseas eliminar esta talla?',
        header: 'Confirmación',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sí, eliminar',
        rejectLabel: 'Cancelar',
        acceptButtonStyleClass: 'p-button-danger p-button-sm', // 🔴 Rojo
        rejectButtonStyleClass: 'p-button-secondary p-button-sm', // ⚪ Gris
        accept: () => {
          this.categoria.eliminarCategoria(categoria.id!, '').subscribe(() => {
            this.cargarCategoria();
            this.messageService.add({
              severity: 'success',
              summary: 'Eliminado',
              detail: 'La talla fue eliminada correctamente'
            });
          });
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
