import { Component, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';

import { CarritoService } from '../../services/carrito.service';

import { ToastService } from '../../services/toast.service';

declare var bootstrap: any;

@Component({
  selector: 'app-login',

  standalone: true,

  imports: [CommonModule, FormsModule],

  templateUrl: './login.html',

  styleUrls: ['./login.css'],
})
export class Login {
  correo = '';

  password = '';

  cargando = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private carritoService: CarritoService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  switchToRegister() {
    const el = document.getElementById('loginSidebar');
    if (el) {
      const off = bootstrap.Offcanvas.getInstance(el);
      off?.hide();
      el.addEventListener('hidden.bs.offcanvas', () => {
        const reg = document.getElementById('registerSidebar');
        if (reg) new bootstrap.Offcanvas(reg).show();
      }, { once: true });
    }
  }

  iniciarSesion() {
    if (!this.correo || !this.password) {
      this.toastService.warning('Completa todos los campos');

      return;
    }

    const data = {
      correo: this.correo,

      password: this.password,
    };

    this.cargando = true;

    this.authService.login(data).subscribe({
      next: (response: any) => {
        console.log(response);
        // GUARDAR SESIÓN

        this.authService.guardarSesion(response);

        // CERRAR LOGIN SIDEBAR

        const sidebar = document.getElementById('loginSidebar');

        if (sidebar) {
          const offcanvas =
            bootstrap.Offcanvas.getInstance(sidebar) || new bootstrap.Offcanvas(sidebar);

          offcanvas.hide();
        }

        // MIGRAR CARRITO TEMP (TOLERA FALLOS PARCIALES)

        const idUsuario = response.idUsuario;

        const carritoTemp = JSON.parse(localStorage.getItem('carritoTemp') || '[]');

        if (carritoTemp.length > 0) {
          const solicitudes = carritoTemp.map((item: any) =>
            this.carritoService
              .agregarProducto(
                idUsuario,
                item.producto.idProducto,
                item.cantidad,
                item.talla,
              )
              .pipe(
                catchError((err) => {
                  console.warn(`Error al migrar producto ${item.producto.idProducto}:`, err);
                  return of(null);
                })
              )
          );

          forkJoin(solicitudes).subscribe({
            next: (resultados: any) => {
              localStorage.removeItem('carritoTemp');

              const fallaron = resultados.filter((r: any) => r === null).length;
              if (fallaron > 0) {
                console.warn(`${fallaron} producto(s) no pudieron migrarse por límite de stock`);
              }

              this.carritoService.obtenerCarrito(idUsuario).subscribe({
                next: (carrito: any) => {
                  const total = carrito.reduce(
                    (sum: number, item: any) => sum + item.cantidad, 0
                  );
                  this.carritoService.actualizarCantidad(total);
                  this.carritoService.forzarRefresh();
                },
                error: () => {
                  const totalMigrado = carritoTemp.reduce(
                    (sum: number, item: any) => sum + item.cantidad, 0
                  );
                  this.carritoService.actualizarCantidad(totalMigrado);
                  this.carritoService.forzarRefresh();
                }
              });
            }
          });
        } else {
          this.carritoService.actualizarCantidad(0);
        }

        // LIMPIAR

        this.correo = '';

        this.password = '';

        this.cargando = false;

        // ESPERAR A QUE CIERRE EL SIDEBAR

        setTimeout(() => {
          if (response.rol === 'ADMIN') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/home']);
          }
        }, 300);
      },

      error: () => {
        this.cargando = false;

        this.toastService.error('Correo o contraseña incorrectos');
      },
    });
    
  }
}
