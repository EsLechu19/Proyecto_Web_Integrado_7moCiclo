import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ProductoService } from '../../services/producto.service';
import { CarritoService } from '../../services/carrito.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Spinner } from '../../shared/spinner/spinner';

@Component({
  selector: 'app-detalle-producto',
  standalone: true,
  imports: [CommonModule, RouterLink, Spinner],
  templateUrl: './detalle-producto.html',
  styleUrls: ['./detalle-producto.css'],
})
export class DetalleProducto implements OnInit {
  producto: any = null;
  cantidad = 1;
  tallaSeleccionada = '';
  cargando = false;
  imagenActual = '';

  constructor(
    private route: ActivatedRoute,
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.cargarProducto(id);
      }
    });
  }

  cargarProducto(id: number) {
    this.cargando = true;
    this.productoService.obtenerProducto(id).subscribe({
      next: (data: any) => {
        this.producto = data;
        this.imagenActual = data.imagenUrl;
        if (data.tallas && data.tallas.length > 0) {
          this.tallaSeleccionada = data.tallas[0].talla;
        }
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  obtenerArrayImagenes(imagenes: string): string[] {
    if (!imagenes) return [];
    try {
      const parsed = JSON.parse(imagenes);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  seleccionarImagen(url: string) {
    this.imagenActual = url;
  }

  seleccionarTalla(talla: string) {
    this.tallaSeleccionada = talla;
  }

  aumentarCantidad() {
    const talla = this.tallaEncontrada();
    const max = talla ? talla.stock : 0;
    if (this.cantidad < max) {
      this.cantidad++;
    }
  }

  tallaEncontrada(): any {
    if (this.producto.tallas && this.producto.tallas.length > 0) {
      return this.producto.tallas.find((t: any) => t.talla === this.tallaSeleccionada);
    }
    return null;
  }

  tallaDisponible(): boolean {
    if (this.producto.tallas && this.producto.tallas.length > 0) {
      const t = this.tallaEncontrada();
      return t && t.stock > 0;
    }
    return false;
  }

  stockTotal(producto: any): number {
    if (producto.tallas && producto.tallas.length > 0) {
      return producto.tallas.reduce((sum: number, t: any) => sum + t.stock, 0);
    }
    return 0;
  }

  agregarAlCarrito() {
    if (!this.authService.isLoggedIn()) {
      this.carritoService.agregarProductoLocal(this.producto, this.cantidad, this.tallaSeleccionada);
      this.toastService.success(`${this.producto.nombre} (${this.tallaSeleccionada}) agregado al carrito`);
      return;
    }

    const idUsuario = this.authService.obtenerIdUsuario();
    this.carritoService.agregarProducto(idUsuario, this.producto.idProducto, this.cantidad, this.tallaSeleccionada)
      .subscribe({
        next: () => {
          this.carritoService.actualizarCantidad(
            this.carritoService.obtenerCantidadActual() + this.cantidad
          );
          this.toastService.success(`${this.producto.nombre} (${this.tallaSeleccionada}) agregado al carrito`);
        },
        error: (err) => {
          this.toastService.error(err.error?.mensaje || 'Error al agregar al carrito');
        }
      });
  }
}
