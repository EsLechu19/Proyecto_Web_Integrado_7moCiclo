import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';

import { ProductoService } from '../../services/producto.service';
import { ProductCard } from '../../shared/product-card/product-card';
import { Producto } from '../../models/producto';

declare const bootstrap: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ProductCard
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('heroCarousel', { static: true }) heroCarousel!: ElementRef;
  @ViewChild('brandsTrack', { static: true }) brandsTrack!: ElementRef;

  productos: Producto[] = [];
  productosMujer: Producto[] = [];
  productosHombre: Producto[] = [];
  productosZapatillas: Producto[] = [];
  correoSuscripcion = '';
  codigoDescuento = '';

  constructor(
    private productoService: ProductoService,
    private cdr: ChangeDetectorRef,
    private title: Title
  ) {}

  suscribirse() {
    if (!this.correoSuscripcion) return;
    const codigo = 'STYLO10';
    this.codigoDescuento = codigo;
    localStorage.setItem('codigoDescuento', codigo);
    localStorage.setItem('correoSuscrito', this.correoSuscripcion);
  }

  copiarCodigo() {
    navigator.clipboard.writeText(this.codigoDescuento);
  }

  ngAfterViewInit(): void {
    const el = this.heroCarousel?.nativeElement;
    if (el) {
      new bootstrap.Carousel(el, { interval: 2500, ride: 'carousel' });
    }
    this.initBrandsMarquee();
  }

  private animFrameId: number = 0;

  initBrandsMarquee() {
    const track = this.brandsTrack?.nativeElement;
    if (!track) return;

    const original = Array.from(track.children);
    original.forEach((child) => {
      track.appendChild((child as HTMLElement).cloneNode(true));
    });

    const firstClone = track.children[original.length] as HTMLElement;
    const setWidth = firstClone.offsetLeft;

    let pos = 0;
    const speed = 0.5;

    const animate = () => {
      pos -= speed;
      if (pos <= -setWidth) {
        pos += setWidth;
      }
      track.style.transform = `translateX(${pos}px)`;
      this.animFrameId = requestAnimationFrame(animate);
    };

    this.animFrameId = requestAnimationFrame(animate);
  }

  ngOnDestroy(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
  }

  ngOnInit(): void {
    this.title.setTitle('StyloStore | Inicio');
    this.listarDestacados();
    this.listarMujer();
    this.listarHombre();
    this.listarZapatillas();
  }

  listarDestacados() {
    this.productoService.obtenerDestacados(4).subscribe({
      next: (data: any) => { this.productos = data; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  listarMujer() {
    this.productoService.listarUltimosPorGenero('MUJER').subscribe({
      next: (data: any) => { this.productosMujer = data; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  listarHombre() {
    this.productoService.listarUltimosPorGenero('HOMBRE').subscribe({
      next: (data: any) => { this.productosHombre = data; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  listarZapatillas() {
    this.productoService.listarUltimosPorCategoria(2).subscribe({
      next: (data: any) => { this.productosZapatillas = data; this.cdr.detectChanges(); },
      error: () => {}
    });
  }
}
