import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root' // Disponible globalmente en la app
})
export class NotificationService {
  constructor(private toastr: ToastrService) {}

  async showSuccess(message: string, title: string = 'Éxito') {
    console.log('Toast Success:', message); // 👈 Debe aparecer en consola
    this.toastr.success(message, title);
  }
  
  showError(message: string, title: string = 'Error') {
    console.log('Toast Error:', message); // 👈 Debe aparecer en consola
    this.toastr.error(message, title);
  }
  

  showWarning(message: string, title: string = 'Advertencia') {
    this.toastr.warning(message, title);
  }

  showInfo(message: string, title: string = 'Información') {
    this.toastr.info(message, title);
  }

  async showConfirm(message: string, title: string = '¿Estás seguro?'): Promise<boolean> {
    const result = await Swal.fire({
      title,
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar'
    });

    return result.isConfirmed;
  }
}
