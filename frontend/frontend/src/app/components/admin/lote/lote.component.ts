import { Component, OnInit } from '@angular/core';
import { Lote, Producto, Talla } from '../../../interfaces/interfaces.interface';
import { LoteServicio } from '../../../services/lote.service';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
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
import { ProductoServicio } from '../../../services/producto.service';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DatePickerModule } from 'primeng/datepicker';
import { CalendarModule } from 'primeng/calendar';
import { TallaServicio } from '../../../services/Talla.service';

@Component({
  selector: 'app-lote',
  templateUrl: './lote.component.html',
  imports:[CommonModule , TableModule, ButtonModule,FormsModule, ReactiveFormsModule, FormsModule,ToastModule,ConfirmDialogModule,DialogModule, InputTextModule, TagModule,
    SelectModule, MultiSelectModule,CalendarModule, ButtonModule,DropdownModule,DatePickerModule,FloatLabelModule, IconFieldModule, InputIconModule],
  providers: [ConfirmationService, MessageService],
  styleUrls: ['./lote.component.css']
})
export class LoteComponent implements OnInit {

  lotes: Lote[] = [];
  tallas: Talla[] = [];
  loteForm!: FormGroup;
  mostrarDialogo: boolean = false;
  productos: Producto[] = [];
  fecha: Date | undefined;
  loading: boolean = true;
  editar: boolean = false;
  minDate: Date | undefined;
  listaGeneros = [
  { label: 'Hombre', value: 1 },
  { label: 'Mujer', value: 2},
  { label: 'Unisex', value: 3 }
];

  maxDate: Date | undefined;
  constructor(private lote: LoteServicio,private talla: TallaServicio, private fb: FormBuilder, private producto: ProductoServicio, private messageService: MessageService,  private confirmationService: ConfirmationService) { }


  ngOnInit() {
    this.initForm();
    this.cargarLotes();
    this.cargarProductos();
    this.cargarTallas()
    this.fecha = new Date();
    let today = new Date();
    let month = today.getMonth();
    let year = today.getFullYear();
    let prevMonth = (month === 0) ? 11 : month -1;
    let prevYear = (prevMonth === 11) ? year - 1 : year;
    let nextMonth = (month === 11) ? 0 : month + 1;
    let nextYear = (nextMonth === 0) ? year + 1 : year;
    this.minDate = new Date();
    this.minDate.setMonth(prevMonth);
    this.minDate.setFullYear(prevYear);
    this.maxDate = new Date();
    this.maxDate.setMonth(nextMonth);
    this.maxDate.setFullYear(nextYear);
  }
  initForm() {
    this.loteForm = this.fb.group({
        id: [null],
        idproducto: ['', Validators.required],
        proveedor: ['', Validators.required],
        fechaingreso: [null, Validators.required],
        idestado: [1, Validators.required], // Valor por defecto activo
        detalles: this.fb.array([]) 
    });
  }
  get detalles(): FormArray {
    return this.loteForm.get('detalles') as FormArray;
  }
  agregarDetalle() {
    const detalle = this.fb.group({
      idtalla: ['', Validators.required],
      idLote: ['0'],
      esGenero: ['', Validators.required],
      preciocosto: [null, Validators.required],
      stock: [null, Validators.required]
    });
    this.detalles.push(detalle);
  }

   eliminarDetalle(i: number) {
    this.detalles.removeAt(i);
  }
  cargarLotes() {
    this.lote.getLotes().subscribe({
      next: (res:any) => {
        this.lotes = res.data;
      },
      error: (err) => {
        console.error('Error al cargar lotes', err);
      }
    });
  }
  cargarTallas(){
    this.talla.getTallas().subscribe({
      next: (res:any) => {
        this.tallas = res.data;
      },
      error: (err) => {
        console.error('Error al cargar lotes', err);
      }
    });
  }
  cargarProductos() {
    this.producto.getProductos().subscribe({
      next: (res:any) => {
         this.loading = false;
        this.productos = res.data;
      },
      error: (err) => {
        console.error('Error al cargar lotes', err);
      }
    });
  }

  abrirRegistro() {
    this.editar = false;
    this.mostrarDialogo = true;
    this.loteForm.reset({ idestado: 1 , fechaingreso: new Date().toISOString().slice(0, 16)});
     this.detalles.clear();
  }
  editarLote(lote: Lote) {
      this.editar = true;
      this.lote.getinfoLotes(lote.id).subscribe({
      next: (res:any) => {
        var lote= res.data;
        var detalle = res.detalles;
        const fechaIngreso = lote.fechaingreso ? new Date(lote.fechaingreso) : null;
        this.mostrarDialogo = true;
        this.loteForm.patchValue({
          id: lote.id,
          idproducto: lote.idproducto,
          proveedor: lote.proveedor,
          fechaingreso: fechaIngreso,
          idestado: lote.idestado
        });
        // Limpiar detalles previos
      this.detalles.clear();

      // Recorrer y añadir al FormArray
      detalle.forEach((d: any) => {
        this.detalles.push(this.fb.group({
          id: [d.id],
          idlote: [d.idlote],
          idtalla: [d.idtalla],
          esGenero: [d.esGenero],
          stock: [d.stock],
          preciocosto: [d.preciocosto]
        }));
      });

      },
      error: (err) => {
        console.error('Error al cargar lotes', err);
      }
    })
      // this.mostrarDialogo = true;
      // this.loteForm.patchValue({
      //   id: lote.id,
      //   idproducto: lote.idproducto,
      //   proveedor: lote.proveedor,
      //   fechaingreso: lote.fechaingreso,
      //   idestado: lote.idestado
      // });
      
  }
  cerrarDialogo(){
      this.mostrarDialogo = false;
  }

  actualizarListado(){
      this.cargarLotes();
  }

  guardarLote() {
    if (this.loteForm.invalid){
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Por favor, complete el nombre de la Talla'
      });
      return;
    } 

    // const formData = new FormData();
    // formData.append('id', this.loteForm.get('id')?.value);
    // formData.append('idproducto', this.loteForm.get('idproducto')?.value);
    // formData.append('proveedor', this.loteForm.get('proveedor')?.value);
    // formData.append('fechaingreso', this.loteForm.get('fechaingreso')?.value);
    // formData.append('idestado', this.loteForm.get('idestado')?.value);
    // formData.append('detalles', JSON.stringify(this.loteForm.get('detalles')?.value));
    const payload = this.loteForm.value;
    this.lote.createLote(payload).subscribe({
      next: (nuevaMarca: Lote) => {
        this.cargarLotes();
        this.cerrarDialogo();
      },
      error: (err) => {
        console.error('Error al registrar la talla', err);
      }
    });
  }
  
  guardarEdicion() {
    if (this.loteForm.invalid) return;

    const marcaData: Lote = this.loteForm.value;
    const formData = new FormData();
    formData.append('id', this.loteForm.get('id')?.value);
    formData.append('idproducto', this.loteForm.get('idproducto')?.value);
    formData.append('proveedor', this.loteForm.get('proveedor')?.value);
    formData.append('fechaingreso', this.loteForm.get('fechaingreso')?.value);
    formData.append('idestado', this.loteForm.get('idestado')?.value);
    this.lote.updateLote(marcaData.id!, formData)
      .subscribe({
        next: (res) => {
            this.cargarLotes();
          
            this.cerrarDialogo();
            this.editar = false; 
        },
        error: (err) => {
          console.error("Error al actualizar la talla", err);
        }
      });
  }

  eliminarLotes(categoria: Lote) {
      this.confirmationService.confirm({
        message: '¿Seguro que deseas eliminar esta talla?',
        header: 'Confirmación',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sí, eliminar',
        rejectLabel: 'Cancelar',
        acceptButtonStyleClass: 'p-button-danger p-button-sm', // 🔴 Rojo
        rejectButtonStyleClass: 'p-button-secondary p-button-sm', // ⚪ Gris
        accept: () => {
          this.lote.eliminarLote(categoria.id!, '').subscribe(() => {
            this.cargarLotes();
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
