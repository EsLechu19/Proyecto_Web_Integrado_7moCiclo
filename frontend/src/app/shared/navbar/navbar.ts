import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';

import { RouterLink } from '@angular/router';

import { CommonModule } from '@angular/common';
import { Subscription, distinctUntilChanged } from 'rxjs';
import { CarritoService } from '../../services/carrito.service';
import { CategoriaService } from '../../services/categoria.service';

import { AuthService } from '../../services/auth.service';

declare var bootstrap: any;

@Component({
  selector: 'app-navbar',

  standalone: true,

  imports: [CommonModule, RouterLink],

  templateUrl: './navbar.html',

  styleUrls: ['./navbar.css'],
})
export class Navbar implements OnInit, OnDestroy {
  carrito: any[] = [];

  total = 0;

  cantidadCarrito = 0;
  categorias: any[] = [];
  loginSub!: Subscription;
  carritoSub!: Subscription;
  refreshSub!: Subscription;

  constructor(
    public authService: AuthService,
    private carritoService: CarritoService,
    private categoriaService: CategoriaService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarCarrito();
    this.cargarCategorias();

    this.loginSub = this.authService.loggedIn$.subscribe(() => {
      this.cargarCarrito();
    });

    this.carritoSub = this.carritoService.cantidad$
      .pipe(distinctUntilChanged())
      .subscribe(() => {
        this.cargarCarrito();
      });

    this.refreshSub = this.carritoService.refresh$
      .subscribe(() => {
        this.cargarCarrito();
      });
  }

  ngOnDestroy(): void {
    this.loginSub?.unsubscribe();
    this.carritoSub?.unsubscribe();
    this.refreshSub?.unsubscribe();
  }

  cargarCarrito() {
    if (!this.authService.isLoggedIn()) {
      this.carrito = this.carritoService.getCarritoLocal();
      this.actualizarDatos();
      this.cdr.detectChanges();
      return;
    }

    const idUsuario = this.authService.obtenerIdUsuario();

    this.carritoService.obtenerCarrito(idUsuario).subscribe({
      next: (data: any) => {
        this.carrito = data;
        this.actualizarDatos();
        this.cdr.detectChanges();
      },
      error: () => {
        this.carrito = [];
        this.actualizarDatos();
        this.cdr.detectChanges();
      }
    });
  }

  cargarCategorias() {
    this.categoriaService.listarCategorias().subscribe({
      next: (data: any) => { this.categorias = data; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  actualizarDatos() {
    this.cantidadCarrito = this.carritoService.calcularCantidad(this.carrito);
    this.total = this.carritoService.calcularTotal(this.carrito);
  }

  stockTalla(item: any): number {
    if (item.talla && item.producto.tallas && item.producto.tallas.length > 0) {
      const t = item.producto.tallas.find((t: any) => t.talla === item.talla);
      if (t) return t.stock;
    }
    return 0;
  }

  aumentarCantidad(item: any) {
    if (item.cantidad >= this.stockTalla(item)) return;

    if (this.authService.isLoggedIn()) {
      this.carritoService
        .actualizarCantidadBD(item.idDetalleCarrito, item.cantidad + 1)
        .subscribe({
          next: () => {
            this.cargarCarrito();
            this.carritoService.actualizarCantidad(this.cantidadCarrito + 1);
          }
        });
      return;
    }

    item.cantidad++;
    this.carritoService.saveCarritoLocal(this.carrito);
    this.actualizarDatos();
    this.carritoService.actualizarCantidad(this.cantidadCarrito);
  }

  disminuirCantidad(item: any) {
    if (this.authService.isLoggedIn()) {
      if (item.cantidad <= 1) {
        this.eliminarItem(item);
        return;
      }
      this.carritoService
        .actualizarCantidadBD(item.idDetalleCarrito, item.cantidad - 1)
        .subscribe({
          next: () => {
            this.cargarCarrito();
            this.carritoService.actualizarCantidad(this.cantidadCarrito - 1);
          }
        });
      return;
    }

    if (item.cantidad > 1) {
      item.cantidad--;
    } else {
      this.eliminarItem(item);
      return;
    }

    this.carritoService.saveCarritoLocal(this.carrito);
    this.actualizarDatos();
    this.carritoService.actualizarCantidad(this.cantidadCarrito);
  }

  eliminarItem(item: any) {
    if (this.authService.isLoggedIn()) {
      this.carritoService
        .eliminarItem(item.idDetalleCarrito)
        .subscribe({
          next: () => {
            this.cargarCarrito();
            this.carritoService.actualizarCantidad(
              Math.max(0, this.cantidadCarrito - item.cantidad)
            );
          }
        });
      return;
    }

    this.carrito = this.carritoService.eliminarProductoLocal(item.producto.idProducto);
    this.actualizarDatos();
    this.cdr.detectChanges();
  }

  irCarrito() {
    const sidebar = document.getElementById('cartSidebar');

    if (sidebar) {
      const offcanvas = bootstrap.Offcanvas.getInstance(sidebar);
      offcanvas?.hide();
    }
  }
}
