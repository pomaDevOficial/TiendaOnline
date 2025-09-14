import { Component, OnInit, OnDestroy, Output, EventEmitter, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  cartItemCount: number = 0;
  private cartSubscription!: Subscription;
  @Output() cartToggle = new EventEmitter<void>();
  isTruckAnimating: boolean = false;
  isMobileMenuOpen: boolean = false;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    // Suscribirse a cambios en el carrito
    this.cartSubscription = this.cartService.getCartItems().subscribe(items => {
      this.cartItemCount = this.cartService.getTotalItems();
    });
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  toggleCart(): void {
    this.cartToggle.emit();
    this.triggerTruckAnimation();
  }

  private triggerTruckAnimation(): void {
    this.isTruckAnimating = true;
    // Reset animation after it completes
    setTimeout(() => {
      this.isTruckAnimating = false;
    }, 2000);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    if (event.target.innerWidth >= 768) {
      this.closeMobileMenu();
    }
  }

  scrollToUbicacion(): void {
    const ubicacionSection = document.getElementById('ubicacion');
    if (ubicacionSection) {
      ubicacionSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
}
