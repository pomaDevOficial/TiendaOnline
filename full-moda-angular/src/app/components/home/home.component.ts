import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  currentSlide = 0;
  private slides: NodeListOf<Element> | null = null;
  private dots: NodeListOf<Element> | null = null;
  private autoPlayInterval: any;

  constructor(
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    // Inicializar el carrusel después de que el DOM esté listo
    setTimeout(() => {
      this.initializeCarousel();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  private initializeCarousel(): void {
    this.slides = document.querySelectorAll('.carousel-slide');
    this.dots = document.querySelectorAll('.carousel-btn');

    if (this.slides && this.slides.length > 0) {
      this.showSlide(this.currentSlide);
      this.autoPlayInterval = setInterval(() => {
        this.nextSlide();
      }, 5000);
    }
  }

  showSlide(index: number): void {
    if (!this.slides || !this.dots) return;

    // Ocultar todas las slides
    this.slides.forEach(slide => slide.classList.remove('active'));
    this.dots.forEach(dot => dot.classList.remove('active'));

    // Mostrar slide actual
    this.slides[index].classList.add('active');
    this.dots[index].classList.add('active');
  }

  nextSlide(): void {
    if (!this.slides) return;
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    this.showSlide(this.currentSlide);
  }

  prevSlide(): void {
    if (!this.slides) return;
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.showSlide(this.currentSlide);
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    this.showSlide(this.currentSlide);
  }

  navigateToCatalog(): void {
    this.router.navigate(['/catalog']);
  }

  filterByBrand(brand: string): void {
    // Guardar el filtro en localStorage para que el catálogo lo use
    localStorage.setItem('filtroMarca', brand);
    this.router.navigate(['/catalog']);
  }
}
