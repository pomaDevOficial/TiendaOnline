import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products: Product[] = [
    // Nike
    {
      id: 1,
      nombre: 'Polos Nike Sport',
      marca: 'Nike',
      precio: 120,
      preciosPorTalla: {
        'S': 110,
        'M': 120,
        'L': 130,
        'XL': 140
      },
      descripcion: 'Polo deportivo Nike de alta calidad. Perfecto para actividades físicas y uso diario.',
      imagenes: [
        'https://via.placeholder.com/400x300?text=Polo+Nike'
      ],
      categoria: 'Ropa Deportiva',
      genero: 'Unisex',
      tallas: ['S', 'M', 'L', 'XL'],
      colores: ['Blanco', 'Negro', 'Azul'],
      stock: 25,
      stockPorTalla: { 'S': 5, 'M': 10, 'L': 8, 'XL': 2 }
    },
    {
      id: 2,
      nombre: 'Zapatillas Nike Air Max',
      marca: 'Nike',
      precio: 300,
      preciosPorTalla: {
        '38': 290,
        '39': 300,
        '40': 310,
        '41': 320,
        '42': 330,
        '43': 340
      },
      descripcion: 'Zapatillas Nike Air Max con amortiguación superior. Confort todo el día.',
      imagenes: [
        'https://via.placeholder.com/400x300?text=Nike+Air+Max'
      ],
      categoria: 'Calzado',
      genero: 'Unisex',
      tallas: ['38', '39', '40', '41', '42', '43'],
      colores: ['Blanco', 'Negro', 'Rojo'],
      stock: 15
    },
    {
      id: 3,
      nombre: 'Camiseta Nike Dry Fit',
      marca: 'Nike',
      precio: 85,
      preciosPorTalla: {
        'S': 75,
        'M': 85,
        'L': 95,
        'XL': 105
      },
      descripcion: 'Camiseta Nike con tecnología Dry Fit para máxima comodidad durante el ejercicio.',
      imagenes: [
        'https://via.placeholder.com/400x300?text=Camiseta+Nike+1',
        'https://via.placeholder.com/400x300?text=Camiseta+Nike+2',
        'https://via.placeholder.com/400x300?text=Camiseta+Nike+3'
      ],
      categoria: 'Ropa Deportiva',
      genero: 'Unisex',
      tallas: ['S', 'M', 'L', 'XL'],
      colores: ['Gris', 'Azul', 'Negro'],
      stock: 30
    },

    // Adidas
    {
      id: 4,
      nombre: 'Zapatillas Adidas Originals',
      marca: 'Adidas',
      precio: 250,
      preciosPorTalla: {
        '38': 240,
        '39': 250,
        '40': 260,
        '41': 270,
        '42': 280,
        '43': 290
      },
      descripcion: 'Zapatillas clásicas Adidas con diseño icónico. Confort y estilo garantizados.',
      imagenes: [
        'https://via.placeholder.com/400x300?text=Zapatillas+Adidas+1',
        'https://via.placeholder.com/400x300?text=Zapatillas+Adidas+2',
        'https://via.placeholder.com/400x300?text=Zapatillas+Adidas+3'
      ],
      categoria: 'Calzado',
      genero: 'Unisex',
      tallas: ['38', '39', '40', '41', '42', '43'],
      colores: ['Blanco', 'Negro', 'Azul'],
      stock: 20
    },
    {
      id: 5,
      nombre: 'Polos Adidas Performance',
      marca: 'Adidas',
      precio: 90,
      preciosPorTalla: {
        'S': 80,
        'M': 90,
        'L': 100,
        'XL': 110
      },
      descripcion: 'Polo Adidas de alto rendimiento. Tecnología avanzada para deportistas.',
      imagenes: [
        'https://via.placeholder.com/400x300?text=Polo+Adidas+1',
        'https://via.placeholder.com/400x300?text=Polo+Adidas+2',
        'https://via.placeholder.com/400x300?text=Polo+Adidas+3'
      ],
      categoria: 'Ropa Deportiva',
      genero: 'Unisex',
      tallas: ['S', 'M', 'L', 'XL'],
      colores: ['Blanco', 'Negro', 'Rojo'],
      stock: 28
    },
    {
      id: 6,
      nombre: 'Short Adidas Climalite',
      marca: 'Adidas',
      precio: 70,
      preciosPorTalla: {
        'S': 60,
        'M': 70,
        'L': 80,
        'XL': 90
      },
      descripcion: 'Short Adidas con tecnología Climalite para mantenerte fresco.',
      imagenes: [
        'https://via.placeholder.com/400x300?text=Short+Adidas+1',
        'https://via.placeholder.com/400x300?text=Short+Adidas+2',
        'https://via.placeholder.com/400x300?text=Short+Adidas+3'
      ],
      categoria: 'Ropa Deportiva',
      genero: 'Unisex',
      tallas: ['S', 'M', 'L', 'XL'],
      colores: ['Negro', 'Azul', 'Gris'],
      stock: 22
    },

    // Puma
    {
      id: 7,
      nombre: 'Shorts Puma Active',
      marca: 'Puma',
      precio: 80,
      preciosPorTalla: {
        'S': 70,
        'M': 80,
        'L': 90,
        'XL': 100
      },
      descripcion: 'Shorts deportivos Puma ideales para entrenamientos intensos.',
      imagenes: [
        'https://via.placeholder.com/400x300?text=Shorts+Puma+1',
        'https://via.placeholder.com/400x300?text=Shorts+Puma+2',
        'https://via.placeholder.com/400x300?text=Shorts+Puma+3'
      ],
      categoria: 'Ropa Deportiva',
      genero: 'Unisex',
      tallas: ['S', 'M', 'L', 'XL'],
      colores: ['Negro', 'Azul', 'Rojo'],
      stock: 18
    },
    {
      id: 8,
      nombre: 'Zapatillas Puma RS-X',
      marca: 'Puma',
      precio: 220,
      preciosPorTalla: {
        '38': 210,
        '39': 220,
        '40': 230,
        '41': 240,
        '42': 250,
        '43': 260
      },
      descripcion: 'Zapatillas Puma RS-X con diseño retro moderno.',
      imagenes: [
        'https://via.placeholder.com/400x300?text=Puma+RS-X+1',
        'https://via.placeholder.com/400x300?text=Puma+RS-X+2',
        'https://via.placeholder.com/400x300?text=Puma+RS-X+3'
      ],
      categoria: 'Calzado',
      genero: 'Unisex',
      tallas: ['38', '39', '40', '41', '42', '43'],
      colores: ['Blanco', 'Negro', 'Rosa'],
      stock: 12
    },
    {
      id: 9,
      nombre: 'Chaqueta Puma Urban',
      marca: 'Puma',
      precio: 200,
      preciosPorTalla: {
        'S': 190,
        'M': 200,
        'L': 210,
        'XL': 220
      },
      descripcion: 'Chaqueta urbana Puma con estilo deportivo. Perfecta para cualquier clima.',
      imagenes: [
        'https://via.placeholder.com/400x300?text=Chaqueta+Puma+1',
        'https://via.placeholder.com/400x300?text=Chaqueta+Puma+2',
        'https://via.placeholder.com/400x300?text=Chaqueta+Puma+3'
      ],
      categoria: 'Ropa Casual',
      genero: 'Unisex',
      tallas: ['S', 'M', 'L', 'XL'],
      colores: ['Negro', 'Azul', 'Gris'],
      stock: 14
    },

    // Levi's
    {
      id: 10,
      nombre: 'Jeans Levi\'s 501',
      marca: 'Levi\'s',
      precio: 180,
      preciosPorTalla: {
        '28': 170,
        '30': 180,
        '32': 190,
        '34': 200,
        '36': 210
      },
      descripcion: 'Los jeans clásicos Levi\'s 501. Un ícono de la moda casual.',
      imagenes: [
        'https://via.placeholder.com/400x300?text=Jeans+Levis+1',
        'https://via.placeholder.com/400x300?text=Jeans+Levis+2',
        'https://via.placeholder.com/400x300?text=Jeans+Levis+3'
      ],
      categoria: 'Ropa Casual',
      genero: 'Unisex',
      tallas: ['28', '30', '32', '34', '36'],
      colores: ['Azul', 'Negro', 'Gris'],
      stock: 16
    },
    {
      id: 11,
      nombre: 'Jeans Levi\'s Skinny',
      marca: 'Levi\'s',
      precio: 160,
      preciosPorTalla: {
        '26': 150,
        '28': 160,
        '30': 170,
        '32': 180,
        '34': 190
      },
      descripcion: 'Jeans Levi\'s skinny fit. Comodidad y estilo en un solo pantalón.',
      imagenes: [
        'https://via.placeholder.com/400x300?text=Jeans+Skinny+Levis+1',
        'https://via.placeholder.com/400x300?text=Jeans+Skinny+Levis+2',
        'https://via.placeholder.com/400x300?text=Jeans+Skinny+Levis+3'
      ],
      categoria: 'Ropa Casual',
      genero: 'Unisex',
      tallas: ['26', '28', '30', '32', '34'],
      colores: ['Azul oscuro', 'Negro', 'Azul claro'],
      stock: 20
    },
    {
      id: 12,
      nombre: 'Camisa Levi\'s Slim',
      marca: 'Levi\'s',
      precio: 95,
      preciosPorTalla: {
        'S': 85,
        'M': 95,
        'L': 105,
        'XL': 115
      },
      descripcion: 'Camisa Levi\'s con corte slim fit. Perfecta para ocasiones casuales.',
      imagenes: [
        'https://via.placeholder.com/400x300?text=Camisa+Levis+1',
        'https://via.placeholder.com/400x300?text=Camisa+Levis+2',
        'https://via.placeholder.com/400x300?text=Camisa+Levis+3'
      ],
      categoria: 'Ropa Casual',
      genero: 'Hombre',
      tallas: ['S', 'M', 'L', 'XL'],
      colores: ['Azul', 'Blanco', 'Gris'],
      stock: 24
    },

    // H&M
    {
      id: 13,
      nombre: 'Camisa H&M Slim Fit',
      marca: 'H&M',
      precio: 60,
      preciosPorTalla: {
        'S': 50,
        'M': 60,
        'L': 70,
        'XL': 80
      },
      descripcion: 'Camisa elegante H&M con corte slim fit. Perfecta para ocasiones formales.',
      imagenes: [
        'https://via.placeholder.com/400x300?text=Camisa+HM+1',
        'https://via.placeholder.com/400x300?text=Camisa+HM+2',
        'https://via.placeholder.com/400x300?text=Camisa+HM+3'
      ],
      categoria: 'Ropa Formal',
      genero: 'Hombre',
      tallas: ['S', 'M', 'L', 'XL'],
      colores: ['Blanco', 'Azul', 'Gris'],
      stock: 35
    },
    {
      id: 14,
      nombre: 'Blusa H&M Casual',
      marca: 'H&M',
      precio: 45,
      preciosPorTalla: {
        'XS': 35,
        'S': 45,
        'M': 55,
        'L': 65
      },
      descripcion: 'Blusa casual H&M con diseño moderno. Cómoda y versátil.',
      imagenes: [
        'https://via.placeholder.com/400x300?text=Blusa+HM+1',
        'https://via.placeholder.com/400x300?text=Blusa+HM+2',
        'https://via.placeholder.com/400x300?text=Blusa+HM+3'
      ],
      categoria: 'Ropa Mujer',
      genero: 'Mujer',
      tallas: ['XS', 'S', 'M', 'L'],
      colores: ['Blanco', 'Rosa', 'Azul'],
      stock: 28
    },
    {
      id: 15,
      nombre: 'Vestido H&M Boho',
      marca: 'H&M',
      precio: 75,
      preciosPorTalla: {
        'XS': 65,
        'S': 75,
        'M': 85,
        'L': 95
      },
      descripcion: 'Vestido bohemio H&M con estampados únicos.',
      imagenes: [
        'https://via.placeholder.com/400x300?text=Vestido+HM+1',
        'https://via.placeholder.com/400x300?text=Vestido+HM+2',
        'https://via.placeholder.com/400x300?text=Vestido+HM+3'
      ],
      categoria: 'Ropa Mujer',
      genero: 'Mujer',
      tallas: ['XS', 'S', 'M', 'L'],
      colores: ['Floral', 'Azul', 'Verde'],
      stock: 15
    },

    // Zara
    {
      id: 16,
      nombre: 'Vestido Zara Boho',
      marca: 'Zara',
      precio: 150,
      preciosPorTalla: {
        'XS': 140,
        'S': 150,
        'M': 160,
        'L': 170
      },
      descripcion: 'Vestido bohemio Zara con diseño único. Ideal para ocasiones especiales.',
      imagenes: [
        'https://via.placeholder.com/400x300?text=Vestido+Zara+1',
        'https://via.placeholder.com/400x300?text=Vestido+Zara+2',
        'https://via.placeholder.com/400x300?text=Vestido+Zara+3'
      ],
      categoria: 'Ropa Mujer',
      genero: 'Mujer',
      tallas: ['XS', 'S', 'M', 'L'],
      colores: ['Beige', 'Azul', 'Negro'],
      stock: 12
    },
    {
      id: 17,
      nombre: 'Falda Zara Elegante',
      marca: 'Zara',
      precio: 120,
      preciosPorTalla: {
        'XS': 110,
        'S': 120,
        'M': 130,
        'L': 140
      },
      descripcion: 'Falda elegante Zara con corte perfecto. Ideal para looks sofisticados.',
      imagenes: [
        'https://via.placeholder.com/400x300?text=Falda+Zara+1',
        'https://via.placeholder.com/400x300?text=Falda+Zara+2',
        'https://via.placeholder.com/400x300?text=Falda+Zara+3'
      ],
      categoria: 'Ropa Mujer',
      genero: 'Mujer',
      tallas: ['XS', 'S', 'M', 'L'],
      colores: ['Negro', 'Beige', 'Rojo'],
      stock: 18
    },
    {
      id: 18,
      nombre: 'Blazer Zara Moderno',
      marca: 'Zara',
      precio: 200,
      preciosPorTalla: {
        'S': 190,
        'M': 200,
        'L': 210,
        'XL': 220
      },
      descripcion: 'Blazer moderno Zara para ocasiones formales.',
      imagenes: [
        'https://via.placeholder.com/400x300?text=Blazer+Zara+1',
        'https://via.placeholder.com/400x300?text=Blazer+Zara+2',
        'https://via.placeholder.com/400x300?text=Blazer+Zara+3'
      ],
      categoria: 'Ropa Formal',
      genero: 'Unisex',
      tallas: ['S', 'M', 'L', 'XL'],
      colores: ['Negro', 'Azul marino', 'Gris'],
      stock: 10
    },

    // Productos adicionales de diferentes rangos de precio
    {
      id: 19,
      nombre: 'Gorra Nike Sport',
      marca: 'Nike',
      precio: 45,
      preciosPorTalla: {
        'Única': 45
      },
      descripcion: 'Gorra Nike deportiva con ajuste perfecto.',
      imagenes: [
        'https://via.placeholder.com/400x300?text=Gorra+Nike+1',
        'https://via.placeholder.com/400x300?text=Gorra+Nike+2',
        'https://via.placeholder.com/400x300?text=Gorra+Nike+3'
      ],
      categoria: 'Accesorios',
      genero: 'Unisex',
      tallas: ['Única'],
      colores: ['Negro', 'Blanco', 'Azul'],
      stock: 40
    },
    {
      id: 20,
      nombre: 'Mochila Adidas Originals',
      marca: 'Adidas',
      precio: 85,
      preciosPorTalla: {
        'Única': 85
      },
      descripcion: 'Mochila Adidas con diseño clásico y funcional.',
      imagenes: [
        'https://via.placeholder.com/400x300?text=Mochila+Adidas+1',
        'https://via.placeholder.com/400x300?text=Mochila+Adidas+2',
        'https://via.placeholder.com/400x300?text=Mochila+Adidas+3'
      ],
      categoria: 'Accesorios',
      genero: 'Unisex',
      tallas: ['Única'],
      colores: ['Negro', 'Azul', 'Rojo'],
      stock: 25
    },
    {
      id: 21,
      nombre: 'Reloj Puma Urban',
      marca: 'Puma',
      precio: 120,
      preciosPorTalla: {
        'Única': 120
      },
      descripcion: 'Reloj Puma con diseño urbano moderno.',
      imagenes: [
        'https://via.placeholder.com/400x300?text=Reloj+Puma+1',
        'https://via.placeholder.com/400x300?text=Reloj+Puma+2',
        'https://via.placeholder.com/400x300?text=Reloj+Puma+3'
      ],
      categoria: 'Accesorios',
      genero: 'Unisex',
      tallas: ['Única'],
      colores: ['Negro', 'Plata', 'Dorado'],
      stock: 15
    },
    {
      id: 22,
      nombre: 'Bufanda Zara Elegante',
      marca: 'Zara',
      precio: 65,
      preciosPorTalla: {
        'Única': 65
      },
      descripcion: 'Bufanda elegante Zara para complementar tu look.',
      imagenes: [
        'https://via.placeholder.com/400x300?text=Bufanda+Zara+1',
        'https://via.placeholder.com/400x300?text=Bufanda+Zara+2',
        'https://via.placeholder.com/400x300?text=Bufanda+Zara+3'
      ],
      categoria: 'Accesorios',
      genero: 'Unisex',
      tallas: ['Única'],
      colores: ['Beige', 'Negro', 'Rojo'],
      stock: 30
    },
    {
      id: 23,
      nombre: 'Cinturón Levi\'s Classic',
      marca: 'Levi\'s',
      precio: 55,
      preciosPorTalla: {
        'S': 50,
        'M': 55,
        'L': 60
      },
      descripcion: 'Cinturón Levi\'s clásico para completar tu outfit.',
      imagenes: [
        'https://via.placeholder.com/400x300?text=Cinturon+Levis+1',
        'https://via.placeholder.com/400x300?text=Cinturon+Levis+2',
        'https://via.placeholder.com/400x300?text=Cinturon+Levis+3'
      ],
      categoria: 'Accesorios',
      genero: 'Unisex',
      tallas: ['S', 'M', 'L'],
      colores: ['Negro', 'Marrón', 'Azul'],
      stock: 35
    },
    {
      id: 24,
      nombre: 'Collar H&M Moderno',
      marca: 'H&M',
      precio: 25,
      preciosPorTalla: {
        'Única': 25
      },
      descripcion: 'Collar moderno H&M para un toque de elegancia.',
      imagenes: [
        'https://via.placeholder.com/400x300?text=Collar+HM+1',
        'https://via.placeholder.com/400x300?text=Collar+HM+2',
        'https://via.placeholder.com/400x300?text=Collar+HM+3'
      ],
      categoria: 'Accesorios',
      genero: 'Mujer',
      tallas: ['Única'],
      colores: ['Oro', 'Plata', 'Negro'],
      stock: 50
    }
  ];

  private productsSubject = new BehaviorSubject<Product[]>(this.products);
  public products$ = this.productsSubject.asObservable();

  private filteredProductsSubject = new BehaviorSubject<Product[]>(this.products);
  public filteredProducts$ = this.filteredProductsSubject.asObservable();

  constructor() { }

  // Obtener todos los productos
  getProducts(): Observable<Product[]> {
    return this.products$;
  }

  // Obtener productos actuales (para carga inicial)
  getCurrentProducts(): Product[] {
    return this.products;
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
    if (!term) return this.products;

    const termLower = term.toLowerCase();
    return this.products.filter(product =>
      product.nombre.toLowerCase().includes(termLower) ||
      product.marca.toLowerCase().includes(termLower) ||
      product.categoria.toLowerCase().includes(termLower) ||
      product.descripcion.toLowerCase().includes(termLower)
    );
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
      filteredProducts = this.searchProducts(filters.busqueda).filter(product =>
        filteredProducts.some(fp => fp.id === product.id)
      );
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
}
