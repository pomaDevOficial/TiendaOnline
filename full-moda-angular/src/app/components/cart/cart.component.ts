import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Output() closeCart = new EventEmitter<void>();

  cartItems: CartItem[] = [];
  subtotal = 0;
  shipping = 0;
  total = 0;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private loadCart(): void {
    this.cartService.getCartItems().subscribe(items => {
      this.cartItems = items;
      this.calculateTotals();
    });
  }

  private calculateTotals(): void {
    this.subtotal = this.cartItems.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
    this.shipping = this.subtotal >= 150 ? 0 : 15;
    this.total = this.subtotal + this.shipping;
  }

  updateQuantity(item: CartItem, change: number): void {
    const newQuantity = item.quantity + change;
    if (newQuantity <= 0) {
      this.removeItem(item);
    } else {
      this.cartService.updateQuantity(item.id, newQuantity, item.talla);
    }
  }

  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.id, item.talla);
  }

  onClose(): void {
    this.closeCart.emit();
  }

  checkout(): void {
    this.onClose();
    this.router.navigate(['/checkout']);
  }

  getItemCount(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }
}
