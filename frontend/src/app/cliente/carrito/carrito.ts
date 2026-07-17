import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { Subscription, distinctUntilChanged } from 'rxjs';

import { CarritoService } from '../../services/carrito.service';
import { PedidoService } from '../../services/pedido.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
declare var bootstrap: any;

@Component({
  selector: 'app-carrito',

  standalone: true,

  imports: [CommonModule, FormsModule, RouterLink],

  templateUrl: './carrito.html',

  styleUrls: ['./carrito.css'],
})
export class Carrito implements OnInit, OnDestroy {
  carrito: any[] = [];

  cantidadCarrito = 0;

  total = 0;
  costoEnvio = 0;
  procesando = false;
  codigoInput = '';
  descuentoAplicado = 0;

  carritoSub!: Subscription;
  refreshSub!: Subscription;

  constructor(
    private carritoService: CarritoService,
    private pedidoService: PedidoService,
    private authService: AuthService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private title: Title
  ) {}

  ngOnInit(): void {
    this.title.setTitle('StyloStore | Carrito de Compras');
    this.obtenerCarrito();
    const codigoGuardado = localStorage.getItem('codigoDescuento');
    if (codigoGuardado) {
      this.codigoInput = codigoGuardado;
    }

    this.carritoSub = this.carritoService.cantidad$
      .pipe(distinctUntilChanged())
      .subscribe(() => {
        this.obtenerCarrito();
      });

    this.refreshSub = this.carritoService.refresh$
      .subscribe(() => {
        this.obtenerCarrito();
      });
  }

  ngOnDestroy(): void {
    this.carritoSub?.unsubscribe();
    this.refreshSub?.unsubscribe();
  }

  obtenerCarrito() {
    if (!localStorage.getItem('token')) {
      this.carrito = this.carritoService.getCarritoLocal();
      this.calcularTotal();
      this.cdr.detectChanges();
      return;
    }

    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    this.carritoService.obtenerCarrito(usuario.idUsuario).subscribe({
      next: (data: any) => {
        this.carrito = data;
        this.calcularTotal();
        this.cdr.detectChanges();
      },
      error: () => {
        this.carrito = [];
        this.calcularTotal();
        this.cdr.detectChanges();
      }
    });
  }

  calcularTotal() {
    this.total = this.carritoService.calcularTotal(this.carrito);
    this.costoEnvio = this.total >= 199 ? 0 : 30;
    this.cantidadCarrito = this.carritoService.calcularCantidad(this.carrito);
    const codigoGuardado = localStorage.getItem('codigoDescuento');
    this.descuentoAplicado = (this.codigoInput && (this.codigoInput === codigoGuardado)) ? this.total * 0.10 : 0;
  }

  aplicarDescuento() {
    const codigoValido = localStorage.getItem('codigoDescuento');
    if (!this.codigoInput || this.codigoInput !== codigoValido) return;
    this.descuentoAplicado = this.total * 0.10;
  }

  quitarDescuento() {
    this.codigoInput = '';
    this.descuentoAplicado = 0;
  }

  aumentarCantidad(item: any) {
    const stockMax = this.stockParaItem(item);
    if (item.cantidad >= stockMax) return;

    if (localStorage.getItem('token')) {
      this.carritoService
        .actualizarCantidadBD(item.idDetalleCarrito, item.cantidad + 1)
        .subscribe({
          next: () => {
            this.obtenerCarrito();
            this.carritoService.actualizarCantidad(this.cantidadCarrito + 1);
          },
        });
      return;
    }

    item.cantidad++;
    this.carritoService.saveCarritoLocal(this.carrito);
    this.calcularTotal();
    this.carritoService.actualizarCantidad(this.cantidadCarrito);
    this.cdr.detectChanges();
  }

  disminuirCantidad(item: any) {
    if (item.cantidad <= 1) {
      this.eliminarItem(item);
      return;
    }

    if (localStorage.getItem('token')) {
      this.carritoService
        .actualizarCantidadBD(item.idDetalleCarrito, item.cantidad - 1)
        .subscribe({
          next: () => {
            this.obtenerCarrito();
            this.carritoService.actualizarCantidad(this.cantidadCarrito - 1);
          },
        });
      return;
    }

    item.cantidad--;
    this.carritoService.saveCarritoLocal(this.carrito);
    this.calcularTotal();
    this.carritoService.actualizarCantidad(this.cantidadCarrito);
    this.cdr.detectChanges();
  }

  eliminarItem(item: any) {
    if (localStorage.getItem('token')) {
      this.carritoService.eliminarItem(item.idDetalleCarrito).subscribe({
        next: () => {
          this.obtenerCarrito();
          this.carritoService.actualizarCantidad(
            Math.max(0, this.cantidadCarrito - item.cantidad)
          );
        },
      });
      return;
    }

    this.carrito = this.carritoService.eliminarProductoLocal(item.producto.idProducto);
    this.calcularTotal();
    this.cdr.detectChanges();
  }

  stockParaItem(item: any): number {
    if (item.talla && item.producto.tallas && item.producto.tallas.length > 0) {
      const t = item.producto.tallas.find((t: any) => t.talla === item.talla);
      if (t) return t.stock;
    }
    return 0;
  }

  procesarCompra() {
    if (!localStorage.getItem('token')) {
      const offcanvasElement = document.getElementById('loginSidebar');

      if (offcanvasElement) {
        const offcanvas = new bootstrap.Offcanvas(offcanvasElement);
        offcanvas.show();
      }
      return;
    }

    if (this.carrito.length === 0) return;

    this.procesando = true;
    const idUsuario = this.authService.obtenerIdUsuario();

    this.pedidoService.confirmarPedido(idUsuario).subscribe({
      next: () => {
        this.procesando = false;
        this.carritoService.actualizarCantidad(0);
        this.mostrarModalExito();
      },
      error: (err) => {
        this.procesando = false;
        this.toastService.error(err.error?.mensaje || 'Error al procesar la compra. Intenta nuevamente.');
        console.log(err);
      }
    });
  }

  mostrarModalExito() {
    const modalEl = document.getElementById('exitoModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl, {
        backdrop: 'static',
        keyboard: false
      });
      modalEl.addEventListener('hidden.bs.modal', () => {
        this.router.navigate(['/home']);
      }, { once: true });
      modal.show();
    }
  }
}
