import { Component, OnInit } from '@angular/core';
import { Categoria, Marca, Producto } from '../../../interfaces/interfaces.interface';
import { MarcaServicio } from '../../../services/Marca.service';
import { CategoriaServicio } from '../../../services/Categoria.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { FileUploadModule } from 'primeng/fileupload';
import { ProductoServicio } from '../../../services/producto.service';
import { environment } from '../../../enviroments/environment';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  imports:[  CommonModule, TableModule, ButtonModule, ReactiveFormsModule, FormsModule,
    ToastModule, ConfirmDialogModule, DialogModule, InputTextModule,
    SelectModule, ButtonModule, IconFieldModule, InputIconModule,DropdownModule,FileUploadModule, 
    TooltipModule],
    providers: [ConfirmationService, MessageService],
  styleUrls: ['./producto.component.css']
})
export class ProductoComponent implements OnInit {

  loading: boolean = true;
  rutaUrl : string = environment.endpoint+"uploads/productos/"
  editarProducto: boolean = false;
  abrirModalProducto: boolean = false;
  abrirModalMarca: boolean = false;
  abrirModalCategoria: boolean = false;

  marcas: Marca[] = [];
  productos: Producto[] = [];
  categorias: Categoria[] = [];

  previewUrl: string | ArrayBuffer | null = null;
  imagenPreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  marcaForm!: FormGroup;
  productoForm!: FormGroup;
  categoriaForm!: FormGroup;

  constructor(private marca: MarcaServicio,private fb: FormBuilder, private confirmationService: ConfirmationService,private producto: ProductoServicio , private categoria: CategoriaServicio, private messageService: MessageService) { }

  ngOnInit() {
    this.initForm()
    this.cargarCategioria();
    this.cargarMarcas();
    this.cargarProductos();
  }
  initForm() {
    this.productoForm = this.fb.group({
      id: [null],
      nombre: [null, Validators.required],
      imagen: [null, Validators.required],
      idcategoria: ['', Validators.required],
      idmarca: ['', Validators.required],
    });

    this.marcaForm = this.fb.group({
      id: [null],
      nombre: ['', Validators.required],
      idestado: [1, Validators.required] 
    });
     this.categoriaForm = this.fb.group({
      id: [null],
      nombre: ['', Validators.required],
      idestado: [1, Validators.required] 
    });

  }
  onFileSelect(event: any) {
  const file = event.files[0];
  if (file) {
    this.productoForm.patchValue({ imagen: file });
    this.productoForm.get('imagen')?.updateValueAndValidity();

    // Previsualizar
    const reader = new FileReader();
    reader.onload = () => {
      this.imagenPreview = reader.result;
    };
    reader.readAsDataURL(file);
  }
}
   onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.productoForm.patchValue({ imagen: this.selectedFile.name }); // solo guardamos el nombre o ruta

      // Vista previa
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }
cargarProductos(){
    this.loading = true;
   this.producto.getProductos().subscribe({
      next: (res: any) => {
        this.loading = false;
        this.productos = res.data;
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al cargar productos', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las productos'
        });
      }
    });
  }
  cargarCategioria(){
    this.categoria.getCategorias().subscribe({
      next: (res: any) => {
        this.categorias = res.data;
      },
      error: (err) => {
        console.error('Error al cargar categorias', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las categorias'
        });
      }
    });
  }

  cargarMarcas(){
    this.marca.getMarcas().subscribe({
      next: (res: any) => {
        this.marcas = res.data;
      },
      error: (err) => {
        console.error('Error al cargar marcas', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las marcas'
        });
      }
    });
  }
  abrirRegistroProducto() {
    this.abrirModalProducto = true;
    this.productoForm.reset({ idestado: 1 });
  }

  abrirRegistroCategoria() {
    this.editarProducto = false;
    this.abrirModalCategoria = true;
    this.categoriaForm.reset({ idestado: 1 });
  }
  abrirRegistroMarca() {
    this.abrirModalMarca = true;
    this.marcaForm.reset({ idestado: 1 });
  }
  EditarProductos(producto: Producto){
    this.editarProducto = true;
    this.abrirModalProducto = true;
    this.productoForm.patchValue(producto);
  }
  cerrarDialogoProducto() {
    this.abrirModalProducto = false;
    this.editarProducto = false;
  }
  cerrarDialogoCategoria() {
    this.abrirModalCategoria = false;
  }
  cerrarDialogoMarca() {
    this.abrirModalMarca = false;
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
      next: (nuevaMarca: Categoria) => {
        this.cargarCategioria();
        this.cerrarDialogoCategoria();
      },
      error: (err) => {
        console.error('Error al registrar la talla', err);
      }
    });
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
        this.cerrarDialogoMarca();
      },
      error: (err) => {
        console.error('Error al registrar la marca', err);
      }
    });
  }
  Eliminar(id: number){
      this.confirmationService.confirm({
      message: '¿Seguro que deseas desactivar este usuario?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, desactivar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-sm',
      accept: () => {
        this.producto.eliminarProducto(id, '').subscribe({
          next: () => {
            this.cargarProductos();
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
  removeImage() {
    this.imagenPreview = null;
    this.productoForm.patchValue({ imagen: null });
  }
  guardarProducto() {
    if (this.productoForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Por favor, complete todos los campos obligatorios'
    });
    return;
  }

  // Construir FormData (para incluir archivo + otros campos)
  const formData = new FormData();
  formData.append('id', this.productoForm.get('id')?.value);
  formData.append('nombre', this.productoForm.get('nombre')?.value);
  formData.append('idcategoria', this.productoForm.get('idcategoria')?.value);
  formData.append('idmarca', this.productoForm.get('idmarca')?.value);
  formData.append('idestado', this.productoForm.get('idestado')?.value);

  const imagenFile = this.productoForm.get('imagen')?.value;
  if (imagenFile) {
    formData.append('imagen', imagenFile);
  }

  this.producto.createProducto(formData).subscribe({
    next: (nuevoProducto: Producto) => {
      this.cargarProductos();   // refresca la lista
      this.cerrarDialogoProducto();     // cierra el modal/dialogo
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Producto registrado correctamente'
      });
    },
    error: (err) => {
      console.error('Error al registrar el producto', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo registrar el producto'
      });
    }
  });
}


}
