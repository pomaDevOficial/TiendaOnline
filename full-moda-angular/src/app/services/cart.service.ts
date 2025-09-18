import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from './product.service';

export interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
  marca: string;
  quantity: number;
  talla?: string;
  icon: string;
  imagen?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartItemsSubject = new BehaviorSubject<CartItem[]>(this.cartItems);
  public cartItems$ = this.cartItemsSubject.asObservable();

  constructor() {
    // Cargar carrito desde localStorage si existe
    this.loadCartFromStorage();
  }

  // Obtener items del carrito
  getCartItems(): Observable<CartItem[]> {
    return this.cartItems$;
  }

  // Obtener items del carrito como array
  getCartItemsArray(): CartItem[] {
    return this.cartItems;
  }

  // Agregar producto al carrito
  addToCart(product: Product, quantity: number = 1, talla?: string, precioEspecifico?: number): void {
    const existingItem = this.cartItems.find(item =>
      item.id === product.id && (
        (item.talla === talla) ||
        (item.talla === undefined && talla === undefined) ||
        (item.talla === '' && talla === '') ||
        (item.talla === null && talla === null)
      )
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const cartItem: CartItem = {
        id: product.id,
        nombre: product.nombre,
        precio: precioEspecifico !== undefined ? Number(precioEspecifico) : Number(product.precio) || 0,
        categoria: product.categoria,
        marca: product.marca,
        quantity: quantity,
        talla: talla,
        icon: product.nombre.charAt(0),
        imagen: product.imagenes && product.imagenes.length > 0 ? product.imagenes[0] : undefined
      };
      this.cartItems.push(cartItem);
    }

    this.updateCart();
    this.saveCartToStorage();
  }

  // Remover producto del carrito
  removeFromCart(productId: number, talla?: string): void {
    this.cartItems = this.cartItems.filter(item =>
      !(item.id === productId && (
        (item.talla === talla) ||
        (item.talla === undefined && talla === undefined) ||
        (item.talla === '' && talla === '') ||
        (item.talla === null && talla === null)
      ))
    );
    this.updateCart();
    this.saveCartToStorage();
  }

  // Actualizar cantidad de un producto
  updateQuantity(productId: number, quantity: number, talla?: string): void {
    const item = this.cartItems.find(item =>
      item.id === productId && (
        (item.talla === talla) ||
        (item.talla === undefined && talla === undefined) ||
        (item.talla === '' && talla === '') ||
        (item.talla === null && talla === null)
      )
    );

    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId, talla);
      } else {
        item.quantity = quantity;
        this.updateCart();
        this.saveCartToStorage();
      }
    }
  }

  // Obtener cantidad total de items
  getTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  // Obtener subtotal
  getSubtotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.precio * item.quantity), 0);
  }

  // Obtener costo de envío
  getShippingCost(): number {
    return 0; // Sin costo de envío
  }

  // Obtener total
  getTotal(): number {
    return this.getSubtotal(); // Total igual al subtotal
  }

  // Limpiar carrito
  clearCart(): void {
    this.cartItems = [];
    this.updateCart();
    this.saveCartToStorage();
  }

  // Verificar si el carrito está vacío
  isEmpty(): boolean {
    return this.cartItems.length === 0;
  }

  // Guardar carrito en localStorage
  private saveCartToStorage(): void {
    // Filtrar propiedades undefined antes de guardar
    const cartToSave = this.cartItems.map(item => {
      const filteredItem: any = {};
      Object.keys(item).forEach(key => {
        if ((item as any)[key] !== undefined) {
          filteredItem[key] = (item as any)[key];
        }
      });
      return filteredItem;
    });
    localStorage.setItem('cart', JSON.stringify(cartToSave));
  }

  // Cargar carrito desde localStorage
  private loadCartFromStorage(): void {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Convertir null a undefined para propiedades opcionales y asegurar precios válidos
        this.cartItems = parsedCart.map((item: any) => ({
          ...item,
          precio: Number(item.precio) || 0, // Asegurar que el precio sea un número válido
          talla: item.talla === null ? undefined : item.talla
        }));
        this.updateCart();
      } catch (error) {
        console.error('Error loading cart from storage:', error);
        this.cartItems = [];
      }
    }
  }

  // Actualizar el BehaviorSubject
  private updateCart(): void {
    this.cartItemsSubject.next([...this.cartItems]);
  }

  // Obtener resumen del carrito
  getCartSummary(): { subtotal: number; shipping: number; total: number; items: number } {
    return {
      subtotal: this.getSubtotal(),
      shipping: 0, // Sin costo de envío
      total: this.getSubtotal(), // Total igual al subtotal
      items: this.getTotalItems()
    };
  }
}
