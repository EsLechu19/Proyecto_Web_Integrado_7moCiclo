import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Sidebar } from '../../shared/sidebar/sidebar';

import { CategoriaService } from '../../services/categoria.service';
import { ToastService } from '../../services/toast.service';

declare var bootstrap: any;

@Component({
  selector: 'app-categorias',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    Sidebar
  ],

  templateUrl: './categorias.html',

  styleUrls: ['./categorias.css']
})

export class Categorias implements OnInit {

  categorias: any[] = [];

  categoriaSeleccionada: any = {};

  modal: any;

  constructor(
    private categoriaService: CategoriaService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private title: Title
  ) {}

  ngOnInit(): void {
    this.title.setTitle('StyloStore | Admin - Categorías');
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.categoriaService
      .listarCategorias()
      .subscribe({
        next: (data: any) => {
          this.categorias = data;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log(err);
        }
      });
  }

  abrirModal(categoria?: any) {
    if (categoria) {
      this.categoriaSeleccionada = { ...categoria };
    } else {
      this.categoriaSeleccionada = { nombre: '', descripcion: '' };
    }

    this.modal = new bootstrap.Modal(
      document.getElementById('categoriaModal')
    );

    this.modal.show();
  }

  guardarCategoria() {
    if (!this.categoriaSeleccionada.nombre) {
      this.toastService.warning('Ingrese nombre de categoría');
      return;
    }

    if (this.categoriaSeleccionada.idCategoria) {
      this.categoriaService
        .actualizarCategoria(
          this.categoriaSeleccionada.idCategoria,
          this.categoriaSeleccionada
        )
        .subscribe({
          next: () => {
            this.cargarCategorias();
            this.modal.hide();
            this.toastService.success('Categoría actualizada');
          },
          error: (err) => {
            console.log(err);
          }
        });
    } else {
      this.categoriaService
        .crearCategoria(this.categoriaSeleccionada)
        .subscribe({
          next: () => {
            this.cargarCategorias();
            this.modal.hide();
            this.toastService.success('Categoría creada');
          },
          error: (err) => {
            console.log(err);
          }
        });
    }
  }

  eliminarCategoria(id: number) {
    if (!confirm('¿Eliminar categoría?')) {
      return;
    }

    this.categoriaService
      .eliminarCategoria(id)
      .subscribe({
        next: () => {
          this.categorias = this.categorias.filter(
            c => c.idCategoria !== id
          );
          this.toastService.success('Categoría eliminada');
        },
        error: (err) => {
          console.log(err);
        }
      });
  }

}
