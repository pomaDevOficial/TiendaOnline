import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Product {
  id: number;
  nombre: string;
  marca: string ;
  precio: number ; // Precio base (para compatibilidad)
  preciosPorTalla: { [talla: string]: number }; // Precios específicos por talla
  descripcion: string;
  imagenes: string[] ;
  categoria: string ;
  genero: string;
  tallas: string[];
  colores: string[];
  stock: number;
  stockPorTalla?: { [talla: string]: number }; // Stock específico por talla
}

export interface ProductFilters {
  marca: string;
  categoria: string;
  genero: string;
  precioMin: number;
  precioMax: number;
  busqueda: string;
  orden: string;
}

export interface Estado {
  id: number;
  nombre: string;
}

export interface Marca {
  id: number;
  nombre: string;
  idestado: number;
  Estado: Estado;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/api/v1/lotetallas/filtro-productos`;
  private marcasApiUrl = `${environment.apiUrl}/api/v1/marcas`;
  private products: Product[] = []

  private productsSubject = new BehaviorSubject<Product[]>(this.products);
  public products$ = this.productsSubject.asObservable();

  private filteredProductsSubject = new BehaviorSubject<Product[]>(this.products);
  public filteredProducts$ = this.filteredProductsSubject.asObservable();

  constructor(private http: HttpClient) { }

  // Obtener todos los productos desde la API
  getProducts(): Observable<Product[]> {
    return this.http.get<{msg: string, data: Product[]}>(this.apiUrl).pipe(
      map(response => response.data.map(product => ({
        ...product,
        // Asegurar campos mínimos requeridos
        nombre: product.nombre || 'Producto sin nombre',
        marca: product.marca || 'Sin marca',
        categoria: product.categoria || 'Sin categoría',
        descripcion: product.descripcion || 'Sin descripción',
        genero: product.genero || 'Unisex',
        tallas: product.tallas || [],
        colores: product.colores || [],
        precio: Number(product.precio) || 0,
        stock: Number(product.stock) || 0,
        preciosPorTalla: Object.keys(product.preciosPorTalla || {}).reduce((acc, talla) => {
          acc[talla] = Number(product.preciosPorTalla![talla]) || 0;
          return acc;
        }, {} as { [talla: string]: number }),
        imagenes: this.processImages(product.imagenes)
      }))),
      tap(products => {
        this.products = products;
        this.productsSubject.next(products);
        this.filteredProductsSubject.next(products);
      }),
      map(() => this.products)
    );
  }

  // Procesar las imágenes para agregar la URL base
  private processImages(imagenes: string[] | string): string[] {
    if (!imagenes) return ['https://via.placeholder.com/400x300?text=Sin+imagen'];

    // Si es un string, convertirlo a array
    const imagesArray = Array.isArray(imagenes) ? imagenes : [imagenes];

    // Procesar cada imagen
    return imagesArray.map(imagen => {
      // Si ya es una URL completa, devolverla tal cual
      if (imagen.startsWith('http://') || imagen.startsWith('https://')) {
        return imagen;
      }
      // Si es un nombre de archivo, agregar la URL base
      return `${environment.apiUrl}/uploads/productos/${imagen}`;
    });
  }

  // Obtener productos actuales (desde la lista local)
  getCurrentProducts(): Product[] {
    return this.products;
  }

  // Cargar productos desde la API (método público para inicialización)
  loadProducts(): Observable<Product[]> {
    return this.getProducts();
  }

  // Cargar productos con filtros desde la API
  loadProductsWithFilters(filters: ProductFilters): Observable<Product[]> {
    // Construir parámetros de consulta
    const params: any = {};

    if (filters.busqueda && filters.busqueda.trim()) {
      params.busqueda = filters.busqueda.trim();
    }

    if (filters.marca && filters.marca !== 'todas') {
      params.marca = filters.marca;
    }

    if (filters.categoria && filters.categoria !== 'todas') {
      params.categoria = filters.categoria;
    }

    if (filters.genero && filters.genero !== 'todos') {
      params.genero = filters.genero;
    }

    if (filters.precioMin && filters.precioMin > 0) {
      params.precioMin = filters.precioMin.toString();
    }

    if (filters.precioMax && filters.precioMax > 0) {
      params.precioMax = filters.precioMax.toString();
    }

    if (filters.orden && filters.orden !== 'default') {
      params.orden = filters.orden;
    }

    return this.http.get<{msg: string, data: Product[]}>(this.apiUrl, { params }).pipe(
      map(response => response.data.map(product => ({
        ...product,
        // Asegurar campos mínimos requeridos
        nombre: product.nombre || 'Producto sin nombre',
        marca: product.marca || 'Sin marca',
        categoria: product.categoria || 'Sin categoría',
        descripcion: product.descripcion || 'Sin descripción',
        genero: product.genero || 'Unisex',
        tallas: product.tallas || [],
        colores: product.colores || [],
        precio: Number(product.precio) || 0,
        stock: Number(product.stock) || 0,
        preciosPorTalla: Object.keys(product.preciosPorTalla || {}).reduce((acc, talla) => {
          acc[talla] = Number(product.preciosPorTalla![talla]) || 0;
          return acc;
        }, {} as { [talla: string]: number }),
        imagenes: this.processImages(product.imagenes)
      }))),
      tap(products => {
        this.products = products;
        this.productsSubject.next(products);
        this.filteredProductsSubject.next(products);
      }),
      map(() => this.products)
    );
  }

  // Obtener producto por ID
  getProductById(id: number): Product | undefined {
    return this.products.find(product => product.id === id);
  }

  // Obtener marcas únicas
  getBrands(): string[] {
    return [...new Set(this.products.map(product => product.marca))].sort();
  }

  // Obtener categorías únicas
  getCategories(): string[] {
    return [...new Set(this.products.map(product => product.categoria))].sort();
  }

  // Obtener géneros únicos
  getGenders(): string[] {
    return [...new Set(this.products.map(product => product.genero))].sort();
  }

  // Obtener rango de precios
  getPriceRange(): { min: number; max: number } {
    const prices = this.products.map(product => product.precio);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }

  // Buscar productos
  searchProducts(term: string): Product[] {
    if (!term || !term.trim()) return this.products;

    const termLower = term.toLowerCase().trim();
    return this.products.filter(product => {
      // Asegurar que los campos sean strings antes de buscar
      const nombre = (product.nombre || '').toLowerCase();
      const marca = (product.marca || '').toLowerCase();
      const categoria = (product.categoria || '').toLowerCase();
      const descripcion = (product.descripcion || '').toLowerCase();

      return nombre.includes(termLower) ||
             marca.includes(termLower) ||
             categoria.includes(termLower) ||
             descripcion.includes(termLower);
    });
  }

  // Filtrar productos
  filterProducts(filters: ProductFilters): Product[] {
    let filteredProducts = [...this.products];

    // Filtro por marca
    if (filters.marca && filters.marca !== 'todas') {
      filteredProducts = filteredProducts.filter(product => product.marca === filters.marca);
    }

    // Filtro por categoría
    if (filters.categoria && filters.categoria !== 'todas') {
      filteredProducts = filteredProducts.filter(product => product.categoria === filters.categoria);
    }

    // Filtro por género
    if (filters.genero && filters.genero !== 'todos') {
      filteredProducts = filteredProducts.filter(product => product.genero === filters.genero);
    }

    // Filtro por precio mínimo
    if (filters.precioMin !== undefined && filters.precioMin !== null && filters.precioMin > 0) {
      filteredProducts = filteredProducts.filter(product => product.precio >= filters.precioMin!);
    }

    // Filtro por precio máximo
    if (filters.precioMax !== undefined && filters.precioMax !== null && filters.precioMax > 0) {
      filteredProducts = filteredProducts.filter(product => product.precio <= filters.precioMax!);
    }

    // Filtro por búsqueda
    if (filters.busqueda) {
      const searchTerm = filters.busqueda.toLowerCase().trim();
      filteredProducts = filteredProducts.filter(product => {
        const nombreMatch = product.nombre?.toLowerCase().includes(searchTerm);
        const marcaMatch = product.marca?.toLowerCase().includes(searchTerm);
        const categoriaMatch = product.categoria?.toLowerCase().includes(searchTerm);
        const descripcionMatch = product.descripcion?.toLowerCase().includes(searchTerm);

        return nombreMatch || marcaMatch || categoriaMatch || descripcionMatch;
      });
    }

    return filteredProducts;
  }

  // Ordenar productos
  sortProducts(products: Product[], order: string): Product[] {
    const sortedProducts = [...products];

    switch (order) {
      case 'precio-asc':
        return sortedProducts.sort((a, b) => a.precio - b.precio);
      case 'precio-desc':
        return sortedProducts.sort((a, b) => b.precio - a.precio);
      case 'nombre-asc':
        return sortedProducts.sort((a, b) => a.nombre.localeCompare(b.nombre));
      case 'nombre-desc':
        return sortedProducts.sort((a, b) => b.nombre.localeCompare(a.nombre));
      case 'marca-asc':
        return sortedProducts.sort((a, b) => a.marca.localeCompare(b.marca));
      default:
        return sortedProducts;
    }
  }

  // Aplicar filtros y actualizar el BehaviorSubject
  applyFilters(filters: ProductFilters): void {
    let filteredProducts = this.filterProducts(filters);

    // Aplicar ordenamiento
    if (filters.orden) {
      filteredProducts = this.sortProducts(filteredProducts, filters.orden);
    }

    this.filteredProductsSubject.next(filteredProducts);
  }

  // Limpiar filtros
  clearFilters(): void {
    this.filteredProductsSubject.next(this.products);
  }

  // Obtener marcas desde la API
  getMarcas(): Observable<Marca[]> {
    return this.http.get<{msg: string, data: Marca[]}>(this.marcasApiUrl).pipe(
      map(response => response.data.slice(0, 6)) // Obtener solo los primeros 5
    );
  }
}
