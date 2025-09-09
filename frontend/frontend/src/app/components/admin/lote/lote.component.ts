import { Component, OnInit } from '@angular/core';
import { Lote, LoteTalla, Producto, Talla } from '../../../interfaces/interfaces.interface';
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
import { LoteTallaServicio } from '../../../services/LoteTalla.service';

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
dialogoStock: boolean = false;
cantidadAgregarDialog: number = 0;
loteTallaSeleccionado: any = null;

  maxDate: Date | undefined;
  constructor(private lote: LoteServicio,
    private loteTallaServicio : LoteTallaServicio,
    private talla: TallaServicio, 
    private fb: FormBuilder, private producto: ProductoServicio,
     private messageService: MessageService, 
      private confirmationService: ConfirmationService
    ) { }


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
      const idLoteActual = this.loteForm.get('id')?.value;

    const detalle = this.fb.group({
      idtalla: ['', Validators.required],
      idlote: [idLoteActual],
      esGenero: ['', Validators.required],
      precioventa: [null, Validators.required],
      stock: [null, Validators.required]
    });
    this.detalles.push(detalle);
  }

  eliminarLoteTalla(id: number) {
  this.confirmationService.confirm({
    message: '¿Seguro que deseas eliminar esta talla del lote?',
    header: 'Confirmación',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, eliminar',
    rejectLabel: 'Cancelar',
    acceptButtonStyleClass: 'p-button-danger p-button-sm',
    rejectButtonStyleClass: 'p-button-secondary p-button-sm',
    accept: () => {
      this.loteTallaServicio.deleteLoteTalla(id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Eliminado',
            detail: 'La talla fue eliminada correctamente'
          });

          // Recargar los detalles del lote actual
          const loteId = this.loteForm.get('id')?.value;
          this.editarLote({ id: loteId } as Lote); // 🔄 reutilizamos tu método
        },
        error: (err) => {
          console.error('Error al eliminar talla', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo eliminar la talla'
          });
        }
      });
    }
  });
}

  abrirDialogoAgregarStock(detalle: any) {
  // Aquí detalle es un FormGroup
  this.loteTallaSeleccionado = {
    id: detalle.get('id')?.value,
    stock: detalle.get('stock')?.value,
    idtalla: detalle.get('idtalla')?.value,
    esGenero: detalle.get('esGenero')?.value,
    precioventa: detalle.get('precioventa')?.value
  };

  this.cantidadAgregarDialog = 0;
  this.dialogoStock = true;

  console.log("LoteTalla seleccionado:", this.loteTallaSeleccionado);
}


confirmarAgregarStock() {
  if (!this.cantidadAgregarDialog || this.cantidadAgregarDialog <= 0) {
    this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Ingrese una cantidad válida' });
    return;
  }

  const payload = {
    idLoteTalla: this.loteTallaSeleccionado.id,
    cantidad: this.cantidadAgregarDialog
  };

  // 👇 Ver lo que envías
  console.log("Payload que se envía al backend:", payload);

  this.loteTallaServicio.agregarStockPorLoteTalla(payload).subscribe({
    next: () => {
      this.messageService.add({ severity: 'success', summary: 'Stock actualizado', detail: 'Se agregó correctamente' });
          this.cantidadAgregarDialog = 0;
            this.dialogoStock = false;
          const loteId = this.loteForm.get('id')?.value;
          this.editarLote({ id: loteId } as Lote); // 🔄 reutilizamos tu método
    },
    error: (err) => {
      console.error('Error al agregar stock', err);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el stock' });
    }
  });
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
        const detalleGroup = this.fb.group({
          id: [d.id],
          idlote: [d.idlote],
          idtalla: [d.idtalla],
          esGenero: [d.esGenero],
          stock: [d.stock],
          precioventa: [d.precioventa]
        });

        // Deshabilitar precioventa si ya tiene ID (registro existente)
        if (d.id) {
          detalleGroup.get('stock')?.disable();
        }

        this.detalles.push(detalleGroup);
      });
    },
    error: (err) => {
      console.error('Error al cargar lotes', err);
    }
  });
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
  
// Método actualizado para guardarEdicion con mensajes
async guardarEdicion() {
  if (this.loteForm.invalid) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Formulario incompleto',
      detail: 'Por favor, complete todos los campos requeridos'
    });
    return;
  }

  try {
    const loteData: Lote = this.loteForm.value;
    const detalles: LoteTalla[] = this.loteForm.get('detalles')?.value || [];

    // Actualizar cabecera
    const loteActualizado = await this.lote.updateLote(loteData.id!, loteData).toPromise();
    
    // Actualizar detalles (todos en una sola llamada)
    console.log(detalles);
    const resultadoDetalles = await this.loteTallaServicio.updateMultipleLoteTalla(detalles).toPromise();
    
    console.log('Actualización completada:', { 
      lote: loteActualizado, 
      detalles: resultadoDetalles 
    });

    // Mensaje de éxito
    this.messageService.add({
      severity: 'success',
      summary: '¡Éxito!',
      detail: 'Lote y detalles actualizados correctamente'
    });
    
    this.cargarLotes();
    this.cerrarDialogo();
    this.editar = false;
    
  } catch (err) {
    console.error("Error al actualizar el lote y detalles", err);
    
    // Mensaje de error
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo actualizar el lote. Por favor, intente nuevamente'
    });
  }
}

  eliminarLotes(lote: Lote) {
      this.confirmationService.confirm({
        message: '¿Seguro que deseas eliminar este Lote?',
        header: 'Confirmación',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sí, eliminar',
        rejectLabel: 'Cancelar',
        acceptButtonStyleClass: 'p-button-danger p-button-sm', // 🔴 Rojo
        rejectButtonStyleClass: 'p-button-secondary p-button-sm', // ⚪ Gris
        accept: () => {
          this.lote.eliminarLote(lote.id!, '').subscribe(() => {
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
        case 9: return 'bg-success';
        case 10: return 'bg-warning';
        case 11: return 'bg-danger';

        default: return 'bg-secondary';
      }
    }

}
