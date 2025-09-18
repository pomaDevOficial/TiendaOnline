import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService, Marca } from '../../services/product.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  currentSlide = 0;
  private slides: NodeListOf<Element> | null = null;
  private dots: NodeListOf<Element> | null = null;
  private autoPlayInterval: any;

  marcas: Marca[] = [];
  marcasLoading = true;
  marcasError = false;

  // WhatsApp Modal
  showWhatsAppModal = false;
  whatsappMessage = '';

  constructor(
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    // Cargar marcas desde la API
    this.loadMarcas();

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

  private loadMarcas(): void {
    this.marcasLoading = true;
    this.marcasError = false;

    this.productService.getMarcas().subscribe({
      next: (marcas) => {
        this.marcas = marcas;
        this.marcasLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar marcas:', error);
        this.marcasError = true;
        this.marcasLoading = false;
        // Fallback: usar marcas por defecto si la API falla
        this.marcas = [
          { id: 1, nombre: 'Nike', idestado: 1, Estado: { id: 1, nombre: 'ACTIVO' } },
          { id: 2, nombre: 'Adidas', idestado: 1, Estado: { id: 1, nombre: 'ACTIVO' } },
          { id: 3, nombre: 'Puma', idestado: 1, Estado: { id: 1, nombre: 'ACTIVO' } },
          { id: 4, nombre: 'Levi\'s', idestado: 1, Estado: { id: 1, nombre: 'ACTIVO' } },
          { id: 5, nombre: 'H&M', idestado: 1, Estado: { id: 1, nombre: 'ACTIVO' } }
        ];
      }
    });
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

  // WhatsApp Modal Methods
  openWhatsAppModal(): void {
    this.showWhatsAppModal = true;
    this.whatsappMessage = 'Hola, me gustaría información sobre sus productos...';
  }

  closeWhatsAppModal(): void {
    this.showWhatsAppModal = false;
    this.whatsappMessage = '';
  }

  sendWhatsAppMessage(): void {
    if (this.whatsappMessage.trim()) {
      const phoneNumber = '51974068266';
      const encodedMessage = encodeURIComponent(this.whatsappMessage.trim());
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

      window.open(whatsappUrl, '_blank');
      this.closeWhatsAppModal();
    }
  }

  // Métodos auxiliares para las marcas
  getMarcaBackground(index: number): string {
    const gradients = [
      'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
      'linear-gradient(135deg, #059669 0%, #047857 100%)',
      'linear-gradient(135deg, #7c3aed 0%, #6b21a8 100%)',
      'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
      'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
    ];
    return gradients[index % gradients.length];
  }

  getMarcaIcon(marcaNombre: string): string {
    const iconMap: { [key: string]: string } = {
      'Nike': 'fas fa-running',
      'Adidas': 'fas fa-futbol',
      'Puma': 'fas fa-paw',
      'Levi\'s': 'fas fa-tshirt',
      'H&M': 'fas fa-store',
      'Zara': 'fas fa-shopping-bag'
    };
    return iconMap[marcaNombre] || 'fas fa-tag';
  }

}
