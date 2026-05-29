import { Component, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {

  usuario = {
    nombre: '',
    correo: '',
  };

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const data = this.authService.obtenerUsuario();
    this.usuario.nombre = data.nombre || '';
    this.usuario.correo = data.correo || '';
  }

  guardarCambios() {
    const idUsuario = this.authService.obtenerIdUsuario();

    if (!idUsuario) {
      this.toastService.warning('Debe iniciar sesión');
      return;
    }

    if (!this.usuario.nombre) {
      this.toastService.warning('Ingrese su nombre');
      return;
    }

    this.usuarioService
      .actualizarUsuario(idUsuario, this.usuario)
      .subscribe({
        next: () => {
          const stored = this.authService.obtenerUsuario();
          stored.nombre = this.usuario.nombre;
          stored.correo = this.usuario.correo;
          localStorage.setItem('usuario', JSON.stringify(stored));
          this.toastService.success('Perfil actualizado');
        },
        error: (err) => {
          console.log(err);
          this.toastService.error('Error al actualizar perfil');
        }
      });
  }

}
