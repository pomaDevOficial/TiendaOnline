import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Product } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent implements OnInit, OnDestroy {
  @Input() product!: Product ;
  @Input() closeSizeModals$!: Subject<void>;
  @Output() productAdded = new EventEmitter<{product: Product, quantity: number}>();
  @Output() productPreview = new EventEmitter<{product: Product, selectedSize: string}>();

  private destroy$ = new Subject<void>();
  currentImageIndex = 0;
  isZoomed = false;
  selectedSize: string = '';
  showSizeModal = false;
  modalQuantity = 1;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.closeSizeModals$) {
      this.closeSizeModals$.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.showSizeModal = false;
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  nextImage(): void {
    if (this.product?.imagenes) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.product.imagenes.length;
    }
  }

  previousImage(): void {
    if (this.product?.imagenes) {
      this.currentImageIndex = this.currentImageIndex === 0
        ? this.product.imagenes.length - 1
        : this.currentImageIndex - 1;
    }
  }

  goToImage(index: number): void {
    if (this.product?.imagenes && index >= 0 && index < this.product.imagenes.length) {
      this.currentImageIndex = index;
    }
  }

  toggleZoom(): void {
    this.isZoomed = !this.isZoomed;
  }

  closeZoom(): void {
    this.isZoomed = false;
  }

  addToCart(): void {
    if (this.product) {
      if (!this.selectedSize || !this.selectedSize.trim()) {
        // Show modal to select size
        this.showSizeModal = true;
        this.modalQuantity = 1;
      } else {
        // Add directly
        this.cartService.addToCart(this.product, 1, this.selectedSize, this.getCurrentPrice());
        this.productAdded.emit({ product: this.product, quantity: 1 });
        // Reset selected size
        this.selectedSize = '';
      }
    }
  }

  viewDetails(): void {
    if (this.product) {
      this.productPreview.emit({ product: this.product, selectedSize: this.selectedSize });
    }
  }


  getShortDescription(): string {
    if (!this.product?.descripcion) return '';
    return this.product.descripcion.length > 80
      ? this.product.descripcion.substring(0, 80) + '...'
      : this.product.descripcion;
  }

  getCurrentPrice(): number {
    if (!this.product) return 0;
    if (this.selectedSize && this.product.preciosPorTalla && this.product.preciosPorTalla[this.selectedSize]) {
      return this.product.preciosPorTalla[this.selectedSize];
    }
    return this.product.precio;
  }

  selectSize(size: string): void {
    this.selectedSize = size;
  }

  selectModalSize(size: string): void {
    this.selectedSize = size;
  }

  increaseModalQuantity(): void {
    if (this.product && this.modalQuantity < this.product.stock) {
      this.modalQuantity++;
    }
  }

  decreaseModalQuantity(): void {
    if (this.modalQuantity > 1) {
      this.modalQuantity--;
    }
  }

  confirmAddToCart(): void {
    if (this.product && this.selectedSize) {
      this.cartService.addToCart(this.product, this.modalQuantity, this.selectedSize, this.getCurrentPrice());
      this.productAdded.emit({ product: this.product, quantity: this.modalQuantity });
      this.showSizeModal = false;
      // Reset selected size
      this.selectedSize = '';
    }
  }

  closeSizeModal(): void {
    this.showSizeModal = false;
  }

  getStockStatusClass(): string {
    if (!this.product?.stock) return 'out-of-stock';
    if (this.product.stock <= 0) return 'out-of-stock';
    if (this.product.stock <= 5) return 'low-stock';
    return 'available';
  }

  getStockStatusText(): string {
    if (!this.product?.stock) return 'Agotado';
    if (this.product.stock <= 0) return 'Agotado';
    if (this.product.stock <= 5) return `Solo ${this.product.stock}`;
    return 'Disponible';
  }
}
