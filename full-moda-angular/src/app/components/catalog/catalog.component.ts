import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, combineLatest, debounceTime, distinctUntilChanged } from 'rxjs';
import { ProductService, Product, ProductFilters } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { CartStateService } from '../../services/cart-state.service';
import { ProductCardComponent } from '../product-card/product-card.component';
import { CartComponent } from '../cart/cart.component';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ProductCardComponent
  ],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss'
})
export class CatalogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  filterForm!: FormGroup;
  products: Product[] = [];
  filteredProducts: Product[] = [];
  brands: string[] = [];
  categories: string[] = [];
  isPreviewOpen = false;
  selectedProduct: Product | null = null;
  isSearching = false;
  selectedSize: string = '';
  previewQuantity: number = 1;
  currentImageIndex = 0;
  isImageZoomed = false;
  currentStock: number = 0;
  currentPrice: number = 0;

  // Notification properties
  showNotification = false;
  notificationProduct: Product | null = null;
  notificationQuantity: number = 1;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private cartService: CartService,
    private cartStateService: CartStateService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadData();
    this.setupProductSubscription();
    // Configurar filtros después de que los datos estén cargados
    setTimeout(() => {
      this.setupFilters();
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.filterForm = this.fb.group({
      search: [''],
      gender: ['todos'],
      brand: ['todas'],
      sort: ['default']
    });
  }

  private loadData(): void {
    // Cargar productos desde la API
    this.productService.loadProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = [...this.products];
        this.updateFilterOptions();
      },
      error: (error) => {
        console.error('Error al cargar productos desde la API:', error);
        // Fallback a datos locales si hay error
        this.products = this.productService.getCurrentProducts();
        this.filteredProducts = [...this.products];
        this.updateFilterOptions();
      }
    });
  }

  // Actualizar opciones de filtro basadas en los productos actuales
  private updateFilterOptions(): void {
    this.brands = this.productService.getBrands();
    this.categories = this.productService.getCategories();
  }

  // Configurar suscripción a cambios en productos filtrados
  private setupProductSubscription(): void {
    this.productService.filteredProducts$.pipe(takeUntil(this.destroy$)).subscribe(products => {
      this.filteredProducts = products;
    });
  }

  private setupFilters(): void {
    // Configurar listeners simples para cada control
    const searchControl = this.filterForm.get('search')!;
    const genderControl = this.filterForm.get('gender')!;
    const brandControl = this.filterForm.get('brand')!;
    const sortControl = this.filterForm.get('sort')!;

    // Listener para búsqueda con debounce manual
    let searchTimeout: any;
    searchControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.applyFiltersFromForm();
      }, 300);
    });

    // Listeners simples para otros controles
    genderControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.applyFiltersFromForm();
    });

    brandControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.applyFiltersFromForm();
    });

    sortControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.applyFiltersFromForm();
    });

    // Aplicar filtros iniciales
    this.applyFiltersFromForm();
  }

  applyFiltersFromForm(): void {
    const search = this.filterForm.get('search')!.value || '';
    const gender = this.filterForm.get('gender')!.value || 'todos';
    const brand = this.filterForm.get('brand')!.value || 'todas';
    const sort = this.filterForm.get('sort')!.value || 'default';

    this.applyFilters(search, gender, brand, sort);
  }

  private applyFilters(search: string, gender: string, brand: string, sort: string): void {
    // Activar indicador de búsqueda si hay término de búsqueda
    this.isSearching = !!(search && search.trim());

    // Crear objeto de filtros
    const filters: ProductFilters = {
      busqueda: search || '',
      genero: gender || 'todos',
      marca: brand || 'todas',
      categoria: 'todas', // No tenemos filtro de categoría en el formulario actual
      precioMin: 0,
      precioMax: 0,
      orden: sort || 'default'
    };

    // Aplicar filtros a través del servicio (filtrado local)
    this.productService.applyFilters(filters);

    // Actualizar opciones de filtro basadas en los resultados
    setTimeout(() => {
      this.updateFilterOptions();
    }, 100);

    // Desactivar indicador de búsqueda después de un breve delay
    if (this.isSearching) {
      setTimeout(() => {
        this.isSearching = false;
      }, 200);
    }
  }

  private sortProducts(products: Product[], sort: string): void {
    switch (sort) {
      case 'precio-asc':
        products.sort((a, b) => a.precio - b.precio);
        break;
      case 'precio-desc':
        products.sort((a, b) => b.precio - a.precio);
        break;
      case 'nombre-asc':
        products.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'nombre-desc':
        products.sort((a, b) => b.nombre.localeCompare(a.nombre));
        break;
      case 'marca-asc':
        products.sort((a, b) => a.marca.localeCompare(b.marca));
        break;
      default:
        // Mantener orden original
        break;
    }
  }

  onProductAdded(event: {product: Product, quantity: number}): void {
    this.showProductNotification(event.product, event.quantity);
  }

  private showProductNotification(product: Product, quantity: number): void {
    this.notificationProduct = product;
    this.notificationQuantity = quantity;
    this.showNotification = true;

    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      this.hideNotification();
    }, 3000);
  }

  hideNotification(): void {
    this.showNotification = false;
    this.notificationProduct = null;
    this.notificationQuantity = 1;
  }

  clearFilters(): void {
    this.filterForm.patchValue({
      search: '',
      gender: 'todos',
      brand: 'todas',
      sort: 'default'
    });
    this.applyFiltersFromForm();
  }

  clearSearch(): void {
    this.filterForm.patchValue({
      search: ''
    });
    this.applyFiltersFromForm();
  }

  setSearchTerm(term: string): void {
    this.filterForm.patchValue({
      search: term
    });
    this.applyFiltersFromForm();
  }

  onSearchInput(event: any): void {
    // Aplicar filtros inmediatamente cuando el usuario escribe
    this.applyFiltersFromForm();
  }

  onGenderChange(): void {
    this.applyFiltersFromForm();
  }

  onBrandChange(): void {
    this.applyFiltersFromForm();
  }

  onSortChange(): void {
    this.applyFiltersFromForm();
  }


  openProductPreview(event: {product: Product, selectedSize: string} | Product): void {
    let product: Product;
    let selectedSize: string = '';

    if ('product' in event) {
      product = event.product;
      selectedSize = event.selectedSize;
    } else {
      product = event;
    }

    this.selectedProduct = product;
    this.isPreviewOpen = true;
    this.previewQuantity = 1;
    this.currentImageIndex = 0;
    this.isImageZoomed = false;

    // Usar la talla seleccionada en el card, o la primera por defecto
    if (selectedSize) {
      this.selectedSize = selectedSize;
    } else if (product.tallas && product.tallas.length > 0) {
      this.selectedSize = product.tallas[0];
    } else {
      this.selectedSize = '';
    }

    // Set initial stock
    this.currentStock = product.stockPorTalla?.[this.selectedSize] || product.stock;
    // Set initial price
    this.currentPrice = product.preciosPorTalla?.[this.selectedSize] || product.precio;
  }

  closeProductPreview(): void {
    this.isPreviewOpen = false;
    this.selectedProduct = null;
  }

  addToCart(product: Product): void {
    if (product && this.selectedSize) {
      this.cartService.addToCart(product, this.previewQuantity, this.selectedSize, this.currentPrice);
      this.showProductNotification(product, this.previewQuantity);
    }
  }

  getProductCount(): number {
    return this.filteredProducts.length;
  }

  selectSize(size: string): void {
    this.selectedSize = size;
    if (this.selectedProduct) {
      this.currentStock = this.selectedProduct.stockPorTalla?.[size] || this.selectedProduct.stock;
      // Actualizar precio según la talla seleccionada
      this.currentPrice = this.selectedProduct.preciosPorTalla?.[size] || this.selectedProduct.precio;
      // Reset quantity if it exceeds the new stock
      if (this.previewQuantity > this.currentStock) {
        this.previewQuantity = this.currentStock;
      }
    }
  }

  increaseQuantity(): void {
    if (this.selectedProduct && this.previewQuantity < this.currentStock) {
      this.previewQuantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.previewQuantity > 1) {
      this.previewQuantity--;
    }
  }

  nextImage(): void {
    if (this.selectedProduct?.imagenes) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.selectedProduct.imagenes.length;
    }
  }

  previousImage(): void {
    if (this.selectedProduct?.imagenes) {
      this.currentImageIndex = this.currentImageIndex === 0
        ? this.selectedProduct.imagenes.length - 1
        : this.currentImageIndex - 1;
    }
  }

  goToImage(index: number): void {
    if (this.selectedProduct?.imagenes && index >= 0 && index < this.selectedProduct.imagenes.length) {
      this.currentImageIndex = index;
    }
  }

  toggleImageZoom(): void {
    this.isImageZoomed = !this.isImageZoomed;
  }

  closeImageZoom(): void {
    this.isImageZoomed = false;
  }

  downloadImage(): void {
    if (this.selectedProduct?.imagenes && this.selectedProduct.imagenes[this.currentImageIndex]) {
      const link = document.createElement('a');
      link.href = this.selectedProduct.imagenes[this.currentImageIndex];
      link.download = `${this.selectedProduct.nombre}-imagen-${this.currentImageIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  openCart(): void {
    this.cartStateService.openCart();
  }

}
