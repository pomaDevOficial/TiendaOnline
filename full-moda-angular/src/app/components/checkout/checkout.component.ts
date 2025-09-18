import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { PedidoService } from '../../services/pedido.service';
import { HeaderComponent } from '../header/header.component';
import { CartComponent } from '../cart/cart.component';
import { FooterComponent } from '../footer/footer.component';

// Interfaz para Persona
interface Persona {
  nombres: string;
  apellidos: string;
  nroidentidad?: string;
  correo: string;
  telefono: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, CartComponent, FooterComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  checkoutForm!: FormGroup;
  cartItems: any[] = [];
  subtotal: number = 0;
  shipping: number = 0;
  totalAmount: number = 0;
  isCartOpen = false;

  // Propiedades para manejo de archivos
  selectedFile: File | null = null;
  fileName: string = '';
  fileSize: string = '';
  isDragOver: boolean = false;

  // Propiedades para animación de carga
  showLoadingAnimation: boolean = false;
  animationStep: 'cart' | 'success' = 'cart';

  // URLs de códigos QR - Preparadas para ser dinámicas desde un servicio externo
  // Actualmente usando imágenes estáticas en base64
  // TODO: Estas URLs serán proporcionadas por parámetros desde un servicio de pagos
  // Ejemplo: this.paymentService.getQrCode('yape', totalAmount)
  yapeQrUrl: string = '';
  plinQrUrl: string = '';

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private productService: ProductService,
    private router: Router,
    private pedidoService: PedidoService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadCartData();
    this.calculateTotals();
    this.loadQrUrls();
    this.setupFileHandling();
  }

  /**
   * Configura los event listeners para el manejo de archivos
   */
  private setupFileHandling(): void {
    // Configurar event listeners después de que la vista se inicialice
    setTimeout(() => {
      this.setupDragAndDrop();
    }, 100);
  }

  /**
   * Configura los eventos de drag and drop
   */
  private setupDragAndDrop(): void {
    const dropZone = document.getElementById('drop-zone');
    const fileSelect = document.getElementById('file-select');

    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => this.onDragOver(e));
      dropZone.addEventListener('dragleave', (e) => this.onDragLeave(e));
      dropZone.addEventListener('drop', (e) => this.onDrop(e));
    }

    if (fileSelect) {
      fileSelect.addEventListener('click', () => this.openFileSelector());
    }
  }

  /**
   * Carga las URLs de los códigos QR
   * En el futuro, estas URLs pueden venir de un servicio o configuración externa
   */
  private loadQrUrls(): void {
    // TODO: Implementar carga desde servicio cuando esté disponible
    // Ejemplo futuro:
    // this.paymentService.getQrUrls().subscribe(urls => {
    //   this.yapeQrUrl = urls.yape;
    //   this.plinQrUrl = urls.plin;
    // });

    // Por ahora mantenemos imágenes estáticas locales (base64)
    // TODO: Reemplazar con URLs reales cuando estén disponibles desde el servicio
    this.yapeQrUrl = 'data:image/svg+xml;base64,' + btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#7C3AED"/>
        <rect x="20" y="20" width="160" height="160" fill="white" rx="10"/>
        <text x="100" y="90" text-anchor="middle" font-family="Arial" font-size="16" fill="#7C3AED" font-weight="bold">YAPE</text>
        <text x="100" y="110" text-anchor="middle" font-family="Arial" font-size="12" fill="#666">QR CODE</text>
        <rect x="40" y="130" width="120" height="8" fill="#7C3AED"/>
        <rect x="40" y="145" width="80" height="8" fill="#7C3AED"/>
      </svg>
    `);
  
    this.plinQrUrl = 'data:image/svg+xml;base64,' + btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#2563EB"/>
        <rect x="20" y="20" width="160" height="160" fill="white" rx="10"/>
        <text x="100" y="90" text-anchor="middle" font-family="Arial" font-size="16" fill="#2563EB" font-weight="bold">PLIN</text>
        <text x="100" y="110" text-anchor="middle" font-family="Arial" font-size="12" fill="#666">QR CODE</text>
        <rect x="40" y="130" width="120" height="8" fill="#2563EB"/>
        <rect x="40" y="145" width="100" height="8" fill="#2563EB"/>
      </svg>
    `);
  }

  private initializeForm(): void {
    this.checkoutForm = this.fb.group({
      nombres: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      nroidentidad: [''],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required]],
      metodoPago: ['transferencia', [Validators.required]],
      comprobante: [null] // Campo para el archivo adjunto
    });
  }

  private loadCartData(): void {
    this.cartItems = this.cartService.getCartItemsArray();
    if (this.cartItems.length === 0) {
      // Si no hay items en el carrito, redirigir al catálogo
      this.router.navigate(['/catalog']);
    }
  }

  private calculateTotals(): void {
    this.subtotal = this.cartItems.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
    this.shipping = 0; // Sin costo de envío
    this.totalAmount = this.subtotal + this.shipping;
  }

  selectPaymentMethod(method: string): void {
    this.checkoutForm.patchValue({ metodoPago: method });
  }


  toggleCart(): void {
    this.isCartOpen = !this.isCartOpen;
  }

  closeCart(): void {
    this.isCartOpen = false;
  }

  goBackToCatalog(): void {
    this.router.navigate(['/catalog']);
  }

  /**
   * Maneja el evento de arrastrar sobre la zona de drop
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  /**
   * Maneja el evento de salir de la zona de drop
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  /**
   * Maneja el evento de soltar archivos en la zona de drop
   */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  /**
   * Abre el selector de archivos
   */
  openFileSelector(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  /**
   * Maneja la selección de archivos desde el input
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFileSelection(input.files[0]);
    }
  }

  /**
   * Procesa el archivo seleccionado
   */
  private handleFileSelection(file: File): void {
    if (this.validateFile(file)) {
      this.selectedFile = file;
      this.fileName = file.name;
      this.fileSize = this.formatFileSize(file.size);
      this.updateFilePreview();
    }
  }

  /**
   * Valida el archivo seleccionado
   */
  private validateFile(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de archivo no permitido. Solo se permiten JPG, PNG y PDF.');
      return false;
    }

    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. Máximo 5MB.');
      return false;
    }

    return true;
  }

  /**
   * Formatea el tamaño del archivo
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Actualiza la vista previa del archivo
   */
  private updateFilePreview(): void {
    const filePreview = document.getElementById('file-preview');
    const dropZone = document.getElementById('drop-zone');

    if (filePreview && dropZone) {
      filePreview.classList.remove('hidden');
      dropZone.style.display = 'none';
    }
  }

  /**
   * Remueve el archivo seleccionado
   */
  removeFile(): void {
    this.selectedFile = null;
    this.fileName = '';
    this.fileSize = '';

    const filePreview = document.getElementById('file-preview');
    const dropZone = document.getElementById('drop-zone');

    if (filePreview && dropZone) {
      filePreview.classList.add('hidden');
      dropZone.style.display = 'block';
    }

    // Limpiar el input
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  onSubmit(): void {
    if (this.checkoutForm.valid) {
      const formData = this.checkoutForm.value;

      // Validar que se haya adjuntado comprobante si es requerido
      if (this.requiresComprobante(formData.metodoPago) && !this.selectedFile) {
        alert('Por favor adjunte el comprobante de pago.');
        return;
      }

      // Mostrar animación de carga
      this.showLoadingAnimation = true;
      this.animationStep = 'cart';

      // Simular procesamiento del pedido
      setTimeout(() => {
        this.processOrder(formData);
      }, 2500); // 2.5 segundos para la animación del carrito
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.checkoutForm.controls).forEach(key => {
        this.checkoutForm.get(key)?.markAsTouched();
      });
    }
  }

  /**
   * Procesa el pedido después de la animación
   */
  private processOrder(formData: any): void {
    // Crear objeto persona
    const persona: Persona = {
      nombres: formData.nombres,
      apellidos: formData.apellidos,
      nroidentidad: formData.nroidentidad || null,
      correo: formData.correo,
      telefono: formData.telefono
    };

    // Mapear método de pago a ID
    const metodoPagoMap: { [key: string]: { id: number } } = {
      'yape': { id: 5 },
      'plin': { id: 6 },
      'transferencia': { id: 4 }
    };

    const metodoPago = metodoPagoMap[formData.metodoPago] || { id: 3 };

    // Preparar productos
    const productos = this.cartItems.map(item => ({
      loteTalla: { id: item.loteTallaId || item.id }, // Asumir que el item tiene loteTallaId
      cantidad: item.quantity,
      precio: item.precio,
      subtotal: item.precio * item.quantity
    }));

    // Crear FormData para enviar archivo
    const formDataToSend = new FormData();
    formDataToSend.append('persona', JSON.stringify(persona));
    formDataToSend.append('metodoPago', JSON.stringify(metodoPago));
    formDataToSend.append('productos', JSON.stringify(productos));
    formDataToSend.append('total', this.totalAmount.toString());
    formDataToSend.append('idusuario', '1'); // Usuario por defecto, ajustar según autenticación

    if (this.selectedFile) {
      formDataToSend.append('imagen', this.selectedFile);
    }

    // Enviar al backend usando el servicio
    this.pedidoService.crearPedidoConComprobante(
      persona,
      metodoPago,
      productos,
      this.totalAmount,
      '1', // Usuario por defecto
      this.selectedFile!
    ).subscribe({
      next: (response:any) => {
        console.log('Pedido creado exitosamente:', response);

        // Guardar datos del pedido en localStorage para la vista de confirmación
        const pedidoData = {
          id: response.data?.id || 'success',
          fecha: new Date().toISOString(),
          cliente: {
            nombre: `${formData.nombres} ${formData.apellidos}`,
            email: formData.correo,
            telefono: formData.telefono,
            metodoPago: formData.metodoPago
          },
          productos: this.cartItems.map(item => ({
            nombre: item.nombre,
            precio: item.precio,
            quantity: item.quantity,
            talla: item.talla,
            imagen: item.imagen,
            icon: item.icon,
            subtotal: item.precio * item.quantity
          })),
          total: this.totalAmount,
          estado: 'confirmado'
        };

        localStorage.setItem('ultimoPedido', JSON.stringify(pedidoData));

        // Limpiar carrito
        this.cartService.clearCart();

        // Cambiar a animación de éxito
        this.animationStep = 'success';

        // Redirigir después de mostrar el check de éxito
        setTimeout(() => {
          this.router.navigate(['/confirmacion'], { queryParams: { pedido: response.data?.id || 'success' } });
        }, 1500);
      },
      error: (error:any) => {
        console.error('Error al crear pedido:', error);
        alert('Error al procesar el pedido: ' + error.message);
        this.showLoadingAnimation = false;
      }
    });
  }

  /**
   * Verifica si el método de pago requiere comprobante
   */
  private requiresComprobante(metodoPago: string): boolean {
    return ['yape', 'plin', 'transferencia'].includes(metodoPago);
  }
}
