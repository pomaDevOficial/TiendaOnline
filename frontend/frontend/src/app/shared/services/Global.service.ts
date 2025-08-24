import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root', // Esto lo hace global
})
export class GlobalService {
  // public fb = inject(FormBuilder);
  // public router = inject(Router)
  // public route = inject(ActivatedRoute)
  constructor(
    public fb: FormBuilder,
    public router: Router,
    public route: ActivatedRoute
  ) {}
  // Exponer Validators para su uso en cualquier componente
  static maxLength(length: number) {
    return Validators.maxLength(length);
  }

  static required() {
    return Validators.required;
  }

  static soloNumeros() {
    return Validators.pattern("^[0-9]*$"); // 🔥 Esto solo permite números
  }
  
  public static validarSoloNumeros(event: any): void {
    const input = event.target;
    input.value = input.value.replace(/[^0-9]/g, '');
  }
  

  public formgroup = FormGroup;

  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }

  
}
