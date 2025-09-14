import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartStateService {
  private isCartOpenSubject = new BehaviorSubject<boolean>(false);
  public isCartOpen$ = this.isCartOpenSubject.asObservable();

  constructor() {}

  openCart(): void {
    this.isCartOpenSubject.next(true);
  }

  closeCart(): void {
    this.isCartOpenSubject.next(false);
  }

  toggleCart(): void {
    const currentState = this.isCartOpenSubject.value;
    this.isCartOpenSubject.next(!currentState);
  }

  getCurrentState(): boolean {
    return this.isCartOpenSubject.value;
  }
}