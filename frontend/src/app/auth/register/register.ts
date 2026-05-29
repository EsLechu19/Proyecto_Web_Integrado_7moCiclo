import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

declare var bootstrap: any;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  nombre = '';

  correo = '';

  password = '';

  cargando = false;

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  switchToLogin() {
    const el = document.getElementById('registerSidebar');
    if (el) {
      const off = bootstrap.Offcanvas.getInstance(el);
      off?.hide();
      el.addEventListener('hidden.bs.offcanvas', () => {
        const login = document.getElementById('loginSidebar');
        if (login) new bootstrap.Offcanvas(login).show();
      }, { once: true });
    }
  }

  registrar() {
    if (!this.nombre || !this.correo || !this.password) {
      this.toastService.warning('Completa todos los campos');
      return;
    }

    const data = {
      nombre: this.nombre,
      correo: this.correo,
      password: this.password
    };

    this.cargando = true;

    this.authService
      .registrar(data)
      .subscribe({

        next: (response) => {
          this.cargando = false;

          const offcanvasEl = document.getElementById('registerSidebar');
          if (offcanvasEl) {
            const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
            offcanvas?.hide();
          }

          this.toastService.success('Cuenta creada exitosamente');
          this.router.navigate(['/']);
        },

        error: (err) => {
          this.cargando = false;
          this.toastService.error(err.error?.mensaje || 'Error al registrar');
        }

      });
  }

}