import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { CartComponent } from './components/cart/cart.component';
import { CartStateService } from './services/cart-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CartComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'full-moda-angular';
  isCartOpen = false;
  private cartStateSubscription!: Subscription;

  constructor(private cartStateService: CartStateService) {}

  ngOnInit(): void {
    // Suscribirse a cambios en el estado del carrito
    this.cartStateSubscription = this.cartStateService.isCartOpen$.subscribe(isOpen => {
      this.isCartOpen = isOpen;
    });
  }

  ngOnDestroy(): void {
    if (this.cartStateSubscription) {
      this.cartStateSubscription.unsubscribe();
    }
  }

  toggleCart(): void {
    this.cartStateService.toggleCart();
  }

  closeCart(): void {
    this.cartStateService.closeCart();
  }
}
