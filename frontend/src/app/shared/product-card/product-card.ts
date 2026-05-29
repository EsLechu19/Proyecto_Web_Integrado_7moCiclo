import {
  Component,
  Input
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-product-card',

  standalone: true,

  imports: [CommonModule, RouterLink],

  templateUrl: './product-card.html',

  styleUrls: ['./product-card.css']
})

export class ProductCard {

  @Input() producto: any;

  constructor(
    private carritoService: CarritoService,
    private authService: AuthService
  ) {}

  stockTotal(producto: any): number {
    if (producto.tallas && producto.tallas.length > 0) {
      return producto.tallas.reduce((sum: number, t: any) => sum + t.stock, 0);
    }
    return 0;
  }

  agregarCarrito() {
    if (this.stockTotal(this.producto) <= 0) return;

    if (!this.authService.isLoggedIn()) {
      this.carritoService.agregarProductoLocal(this.producto, 1);
      return;
    }

    const idUsuario = this.authService.obtenerIdUsuario();

    this.carritoService.agregarProducto(idUsuario, this.producto.idProducto, 1)
      .subscribe({
        next: () => {
          this.carritoService.actualizarCantidad(
            this.carritoService.obtenerCantidadActual() + 1
          );
        },
        error: (err) => {
          console.log(err);
        }
      });
  }

}
