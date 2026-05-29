import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { Sidebar } from '../../shared/sidebar/sidebar';

import { UsuarioService } from '../../services/usuario.service';

declare var bootstrap: any;

@Component({
  selector: 'app-usuarios',

  standalone: true,

  imports: [CommonModule, FormsModule, Sidebar],

  templateUrl: './usuarios.html',

  styleUrls: ['./usuarios.css'],
})
export class Usuarios implements OnInit {
  usuarios: any[] = [];

  usuarioSeleccionado: any = {};

  constructor(private usuarioService: UsuarioService,private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.listarUsuarios();
  }

  listarUsuarios() {
    this.usuarioService.listarUsuarios().subscribe({
      next: (data: any) => {
        this.usuarios = data;
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.log(err);
      },
    });
  }

  abrirModal(usuario: any) {
    this.usuarioSeleccionado = {
      ...usuario,
    };

    const modal = new bootstrap.Modal(document.getElementById('editarModal'));

    modal.show();
  }

  guardarCambios() {
    this.usuarioService
      .actualizarUsuario(this.usuarioSeleccionado.idUsuario, this.usuarioSeleccionado)
      .subscribe({
        next: (usuarioActualizado: any) => {
          const index = this.usuarios.findIndex(
            (usuario) => usuario.idUsuario === usuarioActualizado.idUsuario,
          );

          if (index !== -1) {
            this.usuarios[index] = usuarioActualizado;
          }
          this.cdr.detectChanges();

          const modal = bootstrap.Modal.getInstance(document.getElementById('editarModal'));

          modal.hide();
        },

        error: (err) => {
          console.log(err);
        },
      });
  }

  eliminar(id: number) {
    if (!confirm('¿Eliminar usuario?')) {
      return;
    }

    this.usuarioService.eliminarUsuario(id).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter((usuario) => usuario.idUsuario !== id);
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.log(err);
      },
    });
  }
}
